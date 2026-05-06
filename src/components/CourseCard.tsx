import Link from 'next/link';
import { Course } from '@/types';

interface CourseCardProps {
  course: Course;
}

const levelColors = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
};

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/courses/${course._id}`}>
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden cursor-pointer h-full flex flex-col">
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 h-40 flex items-center justify-center">
          {course.thumbnail ? (
            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white text-5xl font-bold opacity-30">{course.title[0]}</span>
          )}
        </div>
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
              {course.category}
            </span>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${levelColors[course.level]}`}>
              {course.level}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 flex-1">{course.title}</h3>
          <p className="text-gray-500 text-sm line-clamp-2 mb-3">{course.description}</p>
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
            <span className="text-sm text-gray-500">By {course.instructor?.name}</span>
            <span className="font-semibold text-primary-600">
              {course.price === 0 ? 'Free' : `₹${course.price}`}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
