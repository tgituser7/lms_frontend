'use client';

import { useRef, useEffect } from 'react';
import { Chapter } from '@/types';
import { chapterAPI } from '@/lib/api';

interface Props {
  chapter: Chapter;
  courseId: string;
  onProgressUpdate?: (chapterId: string, status: 'learning' | 'completed') => void;
  currentStatus?: 'learning' | 'completed' | null;
  isStudent: boolean;
}

function getYoutubeEmbedUrl(url: string): string {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1` : url;
}

export default function ChapterViewer({ chapter, courseId, onProgressUpdate, currentStatus, isStudent }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const prevent = (e: Event) => e.preventDefault();
    video.addEventListener('contextmenu', prevent);
    return () => video.removeEventListener('contextmenu', prevent);
  }, []);

  const videoSrc = chapter.hasVideo && !chapter.youtubeUrl
    ? `${chapterAPI.videoUrl(courseId, chapter._id)}?token=${token}`
    : null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">{chapter.title}</h3>
        {isStudent && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onProgressUpdate?.(chapter._id, 'learning')}
              className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${
                currentStatus === 'learning'
                  ? 'bg-yellow-100 border-yellow-300 text-yellow-700'
                  : 'border-gray-200 text-gray-500 hover:bg-yellow-50 hover:border-yellow-200 hover:text-yellow-600'
              }`}
            >
              Learning
            </button>
            <button
              onClick={() => onProgressUpdate?.(chapter._id, 'completed')}
              className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${
                currentStatus === 'completed'
                  ? 'bg-green-100 border-green-300 text-green-700'
                  : 'border-gray-200 text-gray-500 hover:bg-green-50 hover:border-green-200 hover:text-green-600'
              }`}
            >
              Completed
            </button>
          </div>
        )}
      </div>

      {/* Uploaded Video */}
      {videoSrc && (
        <div className="rounded-xl overflow-hidden bg-black">
          <video
            ref={videoRef}
            key={videoSrc}
            controls
            controlsList="nodownload nofullscreen noremoteplayback"
            disablePictureInPicture
            disableRemotePlayback
            className="w-full max-h-96"
            onContextMenu={(e) => e.preventDefault()}
          >
            <source src={videoSrc} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {/* YouTube Video */}
      {chapter.youtubeUrl && (
        <div className="rounded-xl overflow-hidden aspect-video">
          <iframe
            src={getYoutubeEmbedUrl(chapter.youtubeUrl)}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      )}

      {/* PDF Notes */}
      {chapter.hasPdf && (
        <div className="rounded-xl overflow-hidden border border-gray-200">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center gap-2">
            <span className="text-red-500 text-lg">📄</span>
            <span className="text-sm font-medium text-gray-700">
              {chapter.pdfOriginalName || 'Notes.pdf'}
            </span>
          </div>
          <iframe
            src={`${chapterAPI.pdfUrl(courseId, chapter._id)}?token=${token}#toolbar=0&navpanes=0&scrollbar=0`}
            className="w-full h-96"
            title="PDF Notes"
          />
        </div>
      )}

      {/* Summary */}
      {chapter.summary && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
          <h4 className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-1">
            <span>📋</span> Summary
          </h4>
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{chapter.summary}</p>
        </div>
      )}

      {/* Text Content */}
      {chapter.content && (
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <h4 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1">
            <span>📝</span> Notes
          </h4>
          <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{chapter.content}</div>
        </div>
      )}
    </div>
  );
}
