'use client';

import { useState } from 'react';
import { chapterAPI } from '@/lib/api';
import { Chapter } from '@/types';

interface Props {
  courseId: string;
  chapter: Chapter;
  onUpdated: () => void;
  onCancel: () => void;
}

export default function EditChapterForm({ courseId, chapter, onUpdated, onCancel }: Props) {
  const [title, setTitle] = useState(chapter.title);
  const [youtubeUrl, setYoutubeUrl] = useState(chapter.youtubeUrl || '');
  const [summary, setSummary] = useState(chapter.summary || '');
  const [content, setContent] = useState(chapter.content || '');
  const [isPreview, setIsPreview] = useState(chapter.isPreview);
  const [duration, setDuration] = useState(chapter.duration?.toString() || '');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await chapterAPI.update(courseId, chapter._id, {
        title,
        youtubeUrl: youtubeUrl || undefined,
        summary: summary || undefined,
        content: content || undefined,
        isPreview,
        duration: duration ? Number(duration) : undefined,
      });

      if (videoFile) {
        const fd = new FormData();
        fd.append('video', videoFile);
        await chapterAPI.uploadVideo(courseId, chapter._id, fd);
      }

      if (pdfFile) {
        const fd = new FormData();
        fd.append('pdf', pdfFile);
        await chapterAPI.uploadPdf(courseId, chapter._id, fd);
      }

      onUpdated();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update chapter');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-4">Edit Chapter</h3>
      {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Chapter Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
            <input type="number" min="0" value={duration} onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 15"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input type="checkbox" id="editIsPreview" checked={isPreview} onChange={(e) => setIsPreview(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary-600" />
            <label htmlFor="editIsPreview" className="text-sm text-gray-600">Free preview</label>
          </div>
        </div>

        {/* Replace video */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Replace Video {chapter.hasVideo && <span className="text-gray-400 font-normal">(has existing video)</span>}
          </label>
          <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:border file:border-gray-300 file:rounded-lg file:text-sm file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100" />
        </div>

        {/* YouTube URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
          <input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>

        {/* Replace PDF */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Replace PDF {chapter.hasPdf && <span className="text-gray-400 font-normal">(has existing PDF)</span>}
          </label>
          <input type="file" accept="application/pdf" onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:border file:border-gray-300 file:rounded-lg file:text-sm file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100" />
        </div>

        {/* Summary */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
          <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={3}
            placeholder="Chapter summary..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
        </div>

        {/* Text Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Text Notes</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={3}
            placeholder="Additional notes..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
        </div>

        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={loading}
            className="bg-primary-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors">
            {loading ? 'Saving...' : 'Save Changes'}
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
