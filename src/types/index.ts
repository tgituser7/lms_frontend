export interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  avatar?: string;
  bio?: string;
  createdAt: string;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: { _id: string; name: string; avatar?: string; bio?: string };
  thumbnail?: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  isPublished: boolean;
  enrolledStudents: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  _id: string;
  title: string;
  content: string;
  videoUrl?: string;
  course: string;
  order: number;
  duration?: number;
  isPreview: boolean;
}

export interface Enrollment {
  _id: string;
  student: string;
  course: Course;
  completedLessons: string[];
  progress: number;
  enrolledAt: string;
  completedAt?: string;
}

export interface ChapterProgress {
  chapter: string;
  status: 'learning' | 'completed';
  updatedAt: string;
}

export interface Chapter {
  _id: string;
  title: string;
  course: string;
  order: number;
  isPreview: boolean;
  duration?: number;
  hasVideo: boolean;
  hasPdf: boolean;
  hasSummary: boolean;
  hasContent: boolean;
  youtubeUrl?: string;
  summary?: string;
  content?: string;
  videoOriginalName?: string;
  pdfOriginalName?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface Stats {
  totalStudents: number;
  totalInstructors: number;
  totalCourses: number;
  totalEnrollments: number;
}
