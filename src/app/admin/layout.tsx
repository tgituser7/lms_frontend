import type { Metadata } from 'next';
import { AdminAuthProvider } from '@/context/AdminAuthContext';

export const metadata: Metadata = {
  title: 'Admin Login — LMS',
  description: 'LMS Administration Panel',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      {children}
    </AdminAuthProvider>
  );
}
