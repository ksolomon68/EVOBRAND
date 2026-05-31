import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext();
const API_URL = 'https://evobrandconcepts.com/api/auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session via JWT
    const checkSession = async () => {
      const token = localStorage.getItem('evobrand_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          // Token invalid or expired
          localStorage.removeItem('evobrand_token');
        }
      } catch (err) {
        console.error('Session check failed:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const signUp = async ({ email, password, name }) => {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Registration failed');

    localStorage.setItem('evobrand_token', data.token);
    setUser(data.user);
    return { data: { user: data.user }, error: null };
  };

  const signIn = async ({ email, password }) => {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

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

  const value = {
    signUp,
    signIn,
    signOut,
    user,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
