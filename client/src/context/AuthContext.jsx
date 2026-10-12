import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const authFetch = async (url, options = {}) => {
    const token = localStorage.getItem('efarmers_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(url, { ...options, headers });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }

    return data;
  };

  // Load user profile if token exists
  useEffect(() => {
    const token = localStorage.getItem('efarmers_token');
    if (token) {
      authFetch('/api/auth/me')
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          localStorage.removeItem('efarmers_token');
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await authFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem('efarmers_token', data.token);
    setUser(data);
    toast(`Welcome back, ${data.name.split(' ')[0]}! 🌱`);
    return data;
  };

  const register = async (userData) => {
    const data = await authFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    localStorage.setItem('efarmers_token', data.token);
    setUser(data);
    toast(`✓ Account created! Welcome, ${data.name.split(' ')[0]}!`);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('efarmers_token');
    setUser(null);
    toast('Logged out. See you soon!');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        authFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
