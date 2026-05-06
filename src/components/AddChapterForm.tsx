'use client';

import { useState } from 'react';
import { chapterAPI } from '@/lib/api';

interface Props {
  courseId: string;
  nextOrder: number;
  onCreated: () => void;
  onCancel: () => void;
}

type ContentType = 'video' | 'youtube' | 'pdf' | 'summary' | 'text';

export default function AddChapterForm({ courseId, nextOrder, onCreated, onCancel }: Props) {
  const [title, setTitle] = useState('');
  const [contentType, setContentType] = useState<ContentType>('video');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await chapterAPI.create(courseId, {
        title, order: nextOrder, isPreview, contentType,
        youtubeUrl: contentType === 'youtube' ? youtubeUrl : undefined,
        summary: contentType === 'summary' ? summary : undefined,
        content: contentType === 'text' ? content : undefined,
      });
      const chapterId = res.data.chapter._id;

      if (contentType === 'video' && videoFile) {
        const fd = new FormData();
        fd.append('video', videoFile);
        await chapterAPI.uploadVideo(courseId, chapterId, fd);
      }
      if (contentType === 'pdf' && pdfFile) {
        const fd = new FormData();
        fd.append('pdf', pdfFile);
        await chapterAPI.uploadPdf(courseId, chapterId, fd);
      }
      onCreated();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create chapter');
    } finally {
      setLoading(false);
    }
  };

  const contentTypes: { value: ContentType; label: string; icon: string }[] = [
    { value: 'video', label: 'Upload Video', icon: '🎥' },
    { value: 'youtube', label: 'YouTube Video', icon: '▶️' },
    { value: 'pdf', label: 'PDF Notes', icon: '📄' },
    { value: 'summary', label: 'Summary', icon: '📋' },
    { value: 'text', label: 'Text Notes', icon: '📝' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-4">Add New Chapter</h3>
      {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Chapter Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required
            placeholder="e.g. Introduction to Variables"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
          <div className="flex flex-wrap gap-2">
            {contentTypes.map((ct) => (
              <button key={ct.value} type="button" onClick={() => setContentType(ct.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  contentType === ct.value ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 text-gray-600 hover:border-primary-300'
                }`}>
                <span>{ct.icon}</span>{ct.label}
              </button>
            ))}
          </div>
        </div>

        {contentType === 'video' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Video File</label>
            <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:border file:border-gray-300 file:rounded-lg file:text-sm file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100" />
            <p className="text-xs text-gray-400 mt-1">Max 500MB. Video will be protected from download.</p>
          </div>
        )}

        {contentType === 'youtube' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
            <input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        )}

        {contentType === 'pdf' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PDF File</label>
            <input type="file" accept="application/pdf" onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:border file:border-gray-300 file:rounded-lg file:text-sm file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100" />
          </div>
        )}

        {contentType === 'summary' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={4}
              placeholder="Write the chapter summary..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
          </div>
        )}

        {contentType === 'text' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Text Notes</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4}
              placeholder="Write notes or text content..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
          </div>
        )}

        <div className="flex items-center gap-2">
          <input type="checkbox" id="isPreview" checked={isPreview} onChange={(e) => setIsPreview(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-primary-600" />
          <label htmlFor="isPreview" className="text-sm text-gray-600">Make this chapter available as free preview</label>
        </div>

        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={loading}
            className="bg-primary-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors">
            {loading ? 'Creating...' : 'Add Chapter'}
          </button>
          <button type="button" onClick={onCancel}
            className="border border-gray-300 text-gray-600 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
