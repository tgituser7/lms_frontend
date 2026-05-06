'use client';

import { useState, useEffect } from 'react';
import { courseAPI } from '@/lib/api';
import { Course } from '@/types';
import CourseCard from '@/components/CourseCard';

const CATEGORIES = ['All', 'Web Development', 'Data Science', 'Design', 'Business', 'Marketing', 'DevOps'];
const LEVELS = ['All', 'beginner', 'intermediate', 'advanced'];

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params: any = {};
        if (search) params.search = search;
        if (category !== 'All') params.category = category;
        if (level !== 'All') params.level = level;
        const res = await courseAPI.getAll(params);
        setCourses(res.data.courses);
      } catch {
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(fetch, 300);
    return () => clearTimeout(timer);
  }, [search, category, level]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Courses</h1>
        <p className="text-gray-500">Explore our catalog of expert-led courses</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {LEVELS.map((l) => <option key={l}>{l}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-gray-200 animate-pulse rounded-xl h-72" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-5xl mb-4">📚</p>
          <p className="text-xl font-medium">No courses found</p>
          <p className="text-sm mt-2">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => <CourseCard key={course._id} course={course} />)}
        </div>
      )}
    </div>
  );
}
