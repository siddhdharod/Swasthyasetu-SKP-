import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Configure axios defaults for all requests
axios.defaults.withCredentials = true;

export const useAuth = () => {
  const [user, setUser] = useState<{ email: string, name?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const resp = await axios.get('http://localhost:8000/api/auth/me');
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
      await axios.post('http://localhost:8000/api/auth/logout');
    } catch (e) {
      console.error("Logout failed", e);
    } finally {
      setUser(null);
    }
  };

  return { user, login, logout, isAuthenticated: !!user, loading };
};

