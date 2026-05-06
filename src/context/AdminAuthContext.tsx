'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { adminAPI } from '@/lib/api';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { setLoading(false); return; }

    adminAPI.getMe()
      .then((res) => {
        const user = res.data.user;
        if (user.role === 'admin') {
          setAdmin(user);
          localStorage.setItem('admin_user', JSON.stringify(user));
        } else {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
        }
      })
      .catch(() => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await adminAPI.login({ email, password });
    if (res.data.user.role !== 'admin') throw new Error('Not an admin account');
    localStorage.setItem('admin_token', res.data.token);
    localStorage.setItem('admin_user', JSON.stringify(res.data.user));
    setAdmin(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
};
