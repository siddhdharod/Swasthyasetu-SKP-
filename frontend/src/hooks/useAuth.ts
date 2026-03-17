import { useState, useEffect, useCallback } from 'react';
import api from '../api/instance';

export const useAuth = () => {
  const [user, setUser] = useState<{ email: string, name?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const resp = await api.get('/auth/me');
      setUser(resp.data);
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = () => {
    checkAuth();
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error("Logout failed", e);
    } finally {
      localStorage.removeItem("userName");
      localStorage.setItem("userRole", "");
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  return { user, login, logout, isAuthenticated: !!user, loading };
};

