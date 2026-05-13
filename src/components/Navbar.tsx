'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary-600">LMS</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link href="/technologies" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
              Technologies
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                  Dashboard
                </Link>
                <span className="text-gray-500 text-sm">Hi, {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/admin/login"
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
                >
                  Admin Login
                </Link>
                <Link
                  href="/login"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
