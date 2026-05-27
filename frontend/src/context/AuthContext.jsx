import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        setUser(JSON.parse(userInfo));
      }
    } catch (error) {
      console.warn('Failed to parse stored user info:', error);
      localStorage.removeItem('userInfo');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAuthResponse = (data) => {
    if (!data.token) {
      throw new Error('No authentication token received from server');
    }
    localStorage.setItem('userInfo', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const login = async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    return handleAuthResponse(data);
  };

  const googleLogin = async (credential) => {
    if (!credential) {
      throw new Error('Google credential is missing — check VITE_GOOGLE_CLIENT_ID is set');
    }
    const { data } = await api.post('/api/auth/google', { credential });
    return handleAuthResponse(data);
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/api/auth/register', { name, email, password });
    return handleAuthResponse(data);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  return (
    <AuthContext.Provider value={{ user, login, googleLogin, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
