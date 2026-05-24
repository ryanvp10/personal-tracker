import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

const AuthContext = createContext();
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://ryanvp10-personaltracker-api.hf.space';
const TOKEN_KEY = 'authToken';
const USER_KEY = 'authUser';
const GUEST_SKIP_KEY = 'skipAuth';

function isGuest() {
  return localStorage.getItem(GUEST_SKIP_KEY) === 'true';
}

function getStoredAuth() {
  const token = localStorage.getItem(TOKEN_KEY);
  const userRaw = localStorage.getItem(USER_KEY);
  const user = userRaw ? JSON.parse(userRaw) : null;
  return { token, user };
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredAuth().token);
  const [user, setUser] = useState(() => getStoredAuth().user);

  const login = useCallback(async (username, password) => {
    localStorage.removeItem(GUEST_SKIP_KEY);
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const payload = await response.json();
    if (!response.ok || !payload.success) throw new Error(payload.error || 'Login failed');
    setToken(payload.data.token);
    setUser(payload.data.user);
    return payload.data.user;
  }, []);

  useEffect(() => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user]);

  const value = useMemo(() => ({
    token,
    user,
    isAuthenticated: Boolean(token),
    isGuest,
    login,
    logout: () => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(GUEST_SKIP_KEY);
      setToken(null);
      setUser(null);
    },
  }), [token, user, login]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export function authFetch(path, options = {}) {
  if (isGuest()) {
    throw new Error('Guest mode cannot access authenticated API endpoints');
  }

  const { token } = getStoredAuth();
  const headers = new Headers(options.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Content-Type') && options.body) headers.set('Content-Type', 'application/json');
  return fetch(`${API_BASE}${path}`, { ...options, headers });
}
