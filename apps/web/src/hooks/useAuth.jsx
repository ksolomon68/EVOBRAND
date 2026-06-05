import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext();
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api/auth'
  : 'https://evobrandconcepts.com/api/auth';
const TIMEOUT_MS = 10000;

function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer));
}

function decodeToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now() ? payload : null;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('evobrand_token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Decode JWT locally first — if expired, clear and bail
      const localPayload = decodeToken(token);
      if (!localPayload) {
        localStorage.removeItem('evobrand_token');
        setLoading(false);
        return;
      }

      // Set user immediately from token so the UI never flashes logged-out
      setUser({
        id: localPayload.id,
        email: localPayload.email,
        name: localPayload.name,
        is_admin: localPayload.is_admin,
      });

      try {
        const response = await fetchWithTimeout(`${API_URL}/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user); // refresh with latest DB values
        } else if (response.status === 401 || response.status === 403) {
          // Token explicitly rejected — log out
          localStorage.removeItem('evobrand_token');
          setUser(null);
        }
        // 5xx or other transient errors: keep the user from the JWT above
      } catch (err) {
        // Network / timeout: keep the user from the JWT above
        console.error('Session check failed:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const signUp = async ({ email, password, name }) => {
    let response;
    try {
      response = await fetchWithTimeout(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
    } catch (err) {
      throw new Error(err.name === 'AbortError' ? 'Request timed out — please try again.' : 'Unable to reach the server. Check your connection.');
    }

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Registration failed');

    localStorage.setItem('evobrand_token', data.token);
    setUser(data.user);
    return { data: { user: data.user }, error: null };
  };

  const signIn = async ({ email, password }) => {
    let response;
    try {
      response = await fetchWithTimeout(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
    } catch (err) {
      throw new Error(err.name === 'AbortError' ? 'Request timed out — please try again.' : 'Unable to reach the server. Check your connection.');
    }

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Login failed');

    localStorage.setItem('evobrand_token', data.token);
    setUser(data.user);
    return { data: { user: data.user }, error: null };
  };

  const signOut = () => {
    localStorage.removeItem('evobrand_token');
    setUser(null);
  };

  const requestPasswordReset = async ({ email }) => {
    let response;
    try {
      response = await fetchWithTimeout(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
    } catch (err) {
      throw new Error(err.name === 'AbortError' ? 'Request timed out — please try again.' : 'Unable to reach the server. Check your connection.');
    }
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Request failed');
    return { data, error: null };
  };

  const resetPassword = async ({ token, password }) => {
    let response;
    try {
      response = await fetchWithTimeout(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
    } catch (err) {
      throw new Error(err.name === 'AbortError' ? 'Request timed out — please try again.' : 'Unable to reach the server. Check your connection.');
    }
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Password reset failed');
    return { data, error: null };
  };

  const value = {
    signUp,
    signIn,
    signOut,
    requestPasswordReset,
    resetPassword,
    user,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
