import axios, { AxiosError } from 'axios';

const API_BASE = "https://lms-backend-gd71.onrender.com/api";
// const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: { name: string; email: string; password: string; role?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const courseAPI = {
  getAll: (params?: { category?: string; level?: string; search?: string }) =>
    api.get('/courses', { params }),
  getOne: (id: string) => api.get(`/courses/${id}`),
  create: (data: Partial<{ title: string; description: string; category: string; level: string; price: number }>) =>
    api.post('/courses', data),
  update: (id: string, data: any) => api.put(`/courses/${id}`, data),
  delete: (id: string) => api.delete(`/courses/${id}`),
  getMyCourses: () => api.get('/courses/my-courses'),
};

export const lessonAPI = {
  getByCourse: (courseId: string) => api.get(`/courses/${courseId}/lessons`),
  create: (courseId: string, data: any) => api.post(`/courses/${courseId}/lessons`, data),
  update: (courseId: string, lessonId: string, data: any) =>
    api.put(`/courses/${courseId}/lessons/${lessonId}`, data),
  delete: (courseId: string, lessonId: string) =>
    api.delete(`/courses/${courseId}/lessons/${lessonId}`),
};

export const enrollmentAPI = {
  getMyEnrollments: () => api.get('/enrollments/my'),
  enroll: (courseId: string) => api.post(`/enrollments/${courseId}`),
  markLessonComplete: (courseId: string, lessonId: string) =>
    api.put(`/enrollments/${courseId}/lessons/${lessonId}/complete`),
};

// Separate instance for admin — uses admin_token and redirects to /admin/login on 401
const adminApi = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

adminApi.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export const adminAPI = {
  login: (data: { email: string; password: string }) => adminApi.post('/auth/login', data),
  getMe: () => adminApi.get('/auth/me'),
  getStats: () => adminApi.get('/admin/stats'),
  getUsers: (role?: string) => adminApi.get('/admin/users', { params: role ? { role } : {} }),
  getUser: (id: string) => adminApi.get(`/admin/users/${id}`),
  createUser: (data: any) => adminApi.post('/admin/users', data),
  updateUser: (id: string, data: any) => adminApi.put(`/admin/users/${id}`, data),
  deleteUser: (id: string) => adminApi.delete(`/admin/users/${id}`),
  getCourses: () => adminApi.get('/admin/courses'),
  getCourse: (id: string) => adminApi.get(`/courses/${id}`),
  createCourse: (data: any) => adminApi.post('/admin/courses', data),
  deleteCourse: (id: string) => adminApi.delete(`/admin/courses/${id}`),
  updateCourse: (id: string, data: any) => adminApi.put(`/courses/${id}`, data),
  assignInstructor: (courseId: string, instructorId: string) =>
    adminApi.put(`/admin/courses/${courseId}/assign`, { instructorId }),
  togglePublish: (courseId: string) => adminApi.put(`/admin/courses/${courseId}/publish`, {}),
  getStudentEnrollments: (studentId: string) => adminApi.get(`/admin/students/${studentId}/enrollments`),
  enrollStudent: (studentId: string, courseId: string) => adminApi.post(`/admin/students/${studentId}/enroll`, { courseId }),
  unenrollStudent: (studentId: string, courseId: string) => adminApi.delete(`/admin/students/${studentId}/enrollments/${courseId}`),
  // Chapter management (uses admin_token)
  getChapters: (courseId: string) => adminApi.get(`/courses/${courseId}/chapters`),
  createChapter: (courseId: string, data: any) => adminApi.post(`/courses/${courseId}/chapters`, data),
  updateChapter: (courseId: string, chapterId: string, data: any) =>
    adminApi.put(`/courses/${courseId}/chapters/${chapterId}`, data),
  deleteChapter: (courseId: string, chapterId: string) =>
    adminApi.delete(`/courses/${courseId}/chapters/${chapterId}`),
  uploadChapterVideo: (courseId: string, chapterId: string, formData: FormData) =>
    adminApi.post(`/courses/${courseId}/chapters/${chapterId}/upload-video`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadChapterPdf: (courseId: string, chapterId: string, formData: FormData) =>
    adminApi.post(`/courses/${courseId}/chapters/${chapterId}/upload-pdf`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  chapterVideoUrl: (courseId: string, chapterId: string) =>
    `${API_BASE}/courses/${courseId}/chapters/${chapterId}/video`,
  chapterPdfUrl: (courseId: string, chapterId: string) =>
    `${API_BASE}/courses/${courseId}/chapters/${chapterId}/pdf`,
};

export const chapterAPI = {
  getByCourse: (courseId: string) => api.get(`/courses/${courseId}/chapters`),
  create: (courseId: string, data: any) => api.post(`/courses/${courseId}/chapters`, data),
  update: (courseId: string, chapterId: string, data: any) =>
    api.put(`/courses/${courseId}/chapters/${chapterId}`, data),
  delete: (courseId: string, chapterId: string) =>
    api.delete(`/courses/${courseId}/chapters/${chapterId}`),
  uploadVideo: (courseId: string, chapterId: string, formData: FormData) =>
    api.post(`/courses/${courseId}/chapters/${chapterId}/upload-video`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadPdf: (courseId: string, chapterId: string, formData: FormData) =>
    api.post(`/courses/${courseId}/chapters/${chapterId}/upload-pdf`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateProgress: (courseId: string, chapterId: string, status: 'learning' | 'completed') =>
    api.put(`/courses/${courseId}/chapters/${chapterId}/progress`, { status }),
  videoUrl: (courseId: string, chapterId: string) =>
    `${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/chapters/${chapterId}/video`,
  pdfUrl: (courseId: string, chapterId: string) =>
    `${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/chapters/${chapterId}/pdf`,
};

export default api;
