'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminGuard from '@/components/admin/AdminGuard';
import { adminAPI } from '@/lib/api';
import { Chapter } from '@/types';
import { useToast } from '@/context/ToastContext';

type ContentType = 'video' | 'youtube' | 'pdf' | 'summary' | 'text';

const contentTypes = [
  { value: 'video' as ContentType, label: 'Upload Video', icon: '🎥' },
  { value: 'youtube' as ContentType, label: 'YouTube', icon: '▶️' },
  { value: 'pdf' as ContentType, label: 'PDF Notes', icon: '📄' },
  { value: 'summary' as ContentType, label: 'Summary', icon: '📋' },
  { value: 'text' as ContentType, label: 'Text Notes', icon: '📝' },
];

const contentIcon = (ch: Chapter) => {
  if (ch.hasVideo) return '🎥';
  if (ch.hasPdf) return '📄';
  if (ch.hasSummary) return '📋';
  if (ch.hasContent) return '📝';
  return '📖';
};

export default function AdminCourseChaptersPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const [courseTitle, setCourseTitle] = useState('');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Add form state
  const [addForm, setAddForm] = useState({ title: '', contentType: 'video' as ContentType, youtubeUrl: '', summary: '', content: '', isPreview: false });
  const [addVideoFile, setAddVideoFile] = useState<File | null>(null);
  const [addPdfFile, setAddPdfFile] = useState<File | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  // Edit form state
  const [editForm, setEditForm] = useState({ title: '', youtubeUrl: '', summary: '', content: '', isPreview: false, duration: '' });
  const [editVideoFile, setEditVideoFile] = useState<File | null>(null);
  const [editPdfFile, setEditPdfFile] = useState<File | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  const loadChapters = async () => {
    const res = await adminAPI.getChapters(id);
    setChapters(res.data.chapters);
  };

  useEffect(() => {
    Promise.all([adminAPI.getCourse(id), adminAPI.getChapters(id)])
      .then(([cRes, chRes]) => {
        setCourseTitle(cRes.data.course.title);
        setChapters(chRes.data.chapters);
      })
      .catch(() => router.push('/admin/courses'))
      .finally(() => setLoading(false));
  }, [id, router]);

  const openEdit = (ch: Chapter) => {
    setEditingChapter(ch);
    setEditForm({ title: ch.title, youtubeUrl: ch.youtubeUrl || '', summary: ch.summary || '', content: ch.content || '', isPreview: ch.isPreview, duration: ch.duration?.toString() || '' });
    setEditVideoFile(null);
    setEditPdfFile(null);
    setEditError('');
    setShowAdd(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setAddLoading(true);
    try {
      const res = await adminAPI.createChapter(id, {
        title: addForm.title,
        order: chapters.length + 1,
        isPreview: addForm.isPreview,
        contentType: addForm.contentType,
        youtubeUrl: addForm.contentType === 'youtube' ? addForm.youtubeUrl : undefined,
        summary: addForm.contentType === 'summary' ? addForm.summary : undefined,
        content: addForm.contentType === 'text' ? addForm.content : undefined,
      });
      const chapterId = res.data.chapter._id;
      if (addForm.contentType === 'video' && addVideoFile) {
        const fd = new FormData(); fd.append('video', addVideoFile);
        await adminAPI.uploadChapterVideo(id, chapterId, fd);
      }
      if (addForm.contentType === 'pdf' && addPdfFile) {
        const fd = new FormData(); fd.append('pdf', addPdfFile);
        await adminAPI.uploadChapterPdf(id, chapterId, fd);
      }
      await loadChapters();
      setShowAdd(false);
      setAddForm({ title: '', contentType: 'video', youtubeUrl: '', summary: '', content: '', isPreview: false });
      setAddVideoFile(null); setAddPdfFile(null);
    } catch (err: any) {
      setAddError(err.response?.data?.message || 'Failed to create chapter');
    } finally {
      setAddLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChapter) return;
    setEditError('');
    setEditLoading(true);
    try {
      await adminAPI.updateChapter(id, editingChapter._id, {
        title: editForm.title,
        youtubeUrl: editForm.youtubeUrl || undefined,
        summary: editForm.summary || undefined,
        content: editForm.content || undefined,
        isPreview: editForm.isPreview,
        duration: editForm.duration ? Number(editForm.duration) : undefined,
      });
      if (editVideoFile) {
        const fd = new FormData(); fd.append('video', editVideoFile);
        await adminAPI.uploadChapterVideo(id, editingChapter._id, fd);
      }
      if (editPdfFile) {
        const fd = new FormData(); fd.append('pdf', editPdfFile);
        await adminAPI.uploadChapterPdf(id, editingChapter._id, fd);
      }
      await loadChapters();
      setEditingChapter(null);
    } catch (err: any) {
      setEditError(err.response?.data?.message || 'Failed to update chapter');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (chapterId: string) => {
    if (!confirm('Delete this chapter? Uploaded files will also be removed.')) return;
    setDeletingId(chapterId);
    try {
      await adminAPI.deleteChapter(id, chapterId);
      setChapters((prev) => prev.filter((c) => c._id !== chapterId));
      if (editingChapter?._id === chapterId) setEditingChapter(null);
    } catch { toast('Failed to delete chapter', 'error'); }
    finally { setDeletingId(null); }
  };

  if (loading) return (
    <AdminGuard>
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-500 border-t-transparent" />
      </div>
    </AdminGuard>
  );

  return (
    <AdminGuard>
      <div className="p-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2 text-sm text-gray-400">
          <Link href="/admin/courses" className="hover:text-gray-600 transition-colors">← Technologies</Link>
          <span>/</span>
          <span className="text-gray-600 truncate max-w-xs">{courseTitle}</span>
        </div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Chapters</h1>
            <p className="text-gray-500 mt-1 text-sm">{chapters.length} chapter{chapters.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/admin/courses/${id}/edit`}
              className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              Edit Details
            </Link>
            <button onClick={() => { setShowAdd(true); setEditingChapter(null); }}
              className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
              + Add Chapter
            </button>
          </div>
        </div>

        {/* Add Chapter Form */}
        {showAdd && (
          <div className="bg-white border border-green-200 rounded-xl p-6 mb-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Add New Chapter</h2>
            {addError && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-4">{addError}</div>}
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input value={addForm.title} onChange={(e) => setAddForm({ ...addForm, title: e.target.value })} required
                  placeholder="Chapter title"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
                <div className="flex flex-wrap gap-2">
                  {contentTypes.map((ct) => (
                    <button key={ct.value} type="button" onClick={() => setAddForm({ ...addForm, contentType: ct.value })}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${addForm.contentType === ct.value ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 text-gray-600 hover:border-green-300'}`}>
                      <span>{ct.icon}</span>{ct.label}
                    </button>
                  ))}
                </div>
              </div>
              {addForm.contentType === 'video' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Video File <span className="text-gray-400 font-normal">(max 500MB)</span></label>
                  <input type="file" accept="video/*" onChange={(e) => setAddVideoFile(e.target.files?.[0] || null)}
                    className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:border file:border-gray-300 file:rounded-lg file:text-sm file:bg-gray-50 hover:file:bg-gray-100" />
                </div>
              )}
              {addForm.contentType === 'youtube' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
                  <input value={addForm.youtubeUrl} onChange={(e) => setAddForm({ ...addForm, youtubeUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              )}
              {addForm.contentType === 'pdf' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PDF File <span className="text-gray-400 font-normal">(max 50MB)</span></label>
                  <input type="file" accept="application/pdf" onChange={(e) => setAddPdfFile(e.target.files?.[0] || null)}
                    className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:border file:border-gray-300 file:rounded-lg file:text-sm file:bg-gray-50 hover:file:bg-gray-100" />
                </div>
              )}
              {addForm.contentType === 'summary' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
                  <textarea value={addForm.summary} onChange={(e) => setAddForm({ ...addForm, summary: e.target.value })} rows={4}
                    placeholder="Write the chapter summary..."
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
                </div>
              )}
              {addForm.contentType === 'text' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Text Notes</label>
                  <textarea value={addForm.content} onChange={(e) => setAddForm({ ...addForm, content: e.target.value })} rows={4}
                    placeholder="Write text notes..."
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
                </div>
              )}
              <div className="flex items-center gap-2">
                <input type="checkbox" id="addPreview" checked={addForm.isPreview} onChange={(e) => setAddForm({ ...addForm, isPreview: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-green-600" />
                <label htmlFor="addPreview" className="text-sm text-gray-600">Free preview for non-enrolled students</label>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={addLoading}
                  className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors">
                  {addLoading ? 'Creating...' : 'Add Chapter'}
                </button>
                <button type="button" onClick={() => setShowAdd(false)}
                  className="border border-gray-300 text-gray-600 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Edit Chapter Form */}
        {editingChapter && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Edit: {editingChapter.title}</h2>
            {editError && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-4">{editError}</div>}
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                  <input type="number" min="0" value={editForm.duration} onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                    placeholder="e.g. 15"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input type="checkbox" id="editPreview" checked={editForm.isPreview} onChange={(e) => setEditForm({ ...editForm, isPreview: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-green-600" />
                  <label htmlFor="editPreview" className="text-sm text-gray-600">Free preview</label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Replace Video {editingChapter.hasVideo && <span className="text-gray-400 font-normal">(has existing)</span>}
                </label>
                <input type="file" accept="video/*" onChange={(e) => setEditVideoFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:border file:border-gray-300 file:rounded-lg file:text-sm file:bg-gray-50 hover:file:bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
                <input value={editForm.youtubeUrl} onChange={(e) => setEditForm({ ...editForm, youtubeUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Replace PDF {editingChapter.hasPdf && <span className="text-gray-400 font-normal">(has existing)</span>}
                </label>
                <input type="file" accept="application/pdf" onChange={(e) => setEditPdfFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:border file:border-gray-300 file:rounded-lg file:text-sm file:bg-gray-50 hover:file:bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
                <textarea value={editForm.summary} onChange={(e) => setEditForm({ ...editForm, summary: e.target.value })} rows={3}
                  placeholder="Chapter summary..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Text Notes</label>
                <textarea value={editForm.content} onChange={(e) => setEditForm({ ...editForm, content: e.target.value })} rows={3}
                  placeholder="Additional notes..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={editLoading}
                  className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors">
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setEditingChapter(null)}
                  className="border border-gray-300 text-gray-600 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Chapter List */}
        <div className="space-y-3">
          {chapters.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-16 text-center">
              <p className="text-4xl mb-3">📚</p>
              <p className="text-gray-500 font-medium">No chapters yet</p>
              <p className="text-sm text-gray-400 mt-1">Click "Add Chapter" to get started</p>
            </div>
          ) : (
            chapters.map((chapter, idx) => (
              <div key={chapter._id} className={`bg-white rounded-xl border shadow-sm transition-shadow hover:shadow-md ${editingChapter?._id === chapter._id ? 'border-amber-300' : 'border-gray-100'}`}>
                <div className="flex items-center gap-4 p-4">
                  <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center text-green-700 font-bold text-sm flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-base">{contentIcon(chapter)}</span>
                      <h3 className="font-semibold text-gray-900 truncate">{chapter.title}</h3>
                      {chapter.isPreview && <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full flex-shrink-0">Preview</span>}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {chapter.hasVideo && <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">Video</span>}
                      {chapter.youtubeUrl && <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">YouTube</span>}
                      {chapter.hasPdf && <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">PDF</span>}
                      {chapter.hasSummary && <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">Summary</span>}
                      {chapter.hasContent && <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">Notes</span>}
                      {chapter.duration && <span className="text-xs text-gray-400">{chapter.duration} min</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => openEdit(chapter)}
                      className="text-sm text-blue-500 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(chapter._id)} disabled={deletingId === chapter._id}
                      className="text-sm text-red-500 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50">
                      {deletingId === chapter._id ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminGuard>
  );
}
