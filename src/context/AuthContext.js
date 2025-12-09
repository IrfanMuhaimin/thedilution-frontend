//context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed. Please check your credentials.');
      }

      const data = await response.json();

      const userData = {
        userId: data.userId,
        username: data.username,
        role: data.role,
        token: data.accessToken      
      };

      console.log('User Data being saved:', userData);

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      navigate('/');
      return { success: true };

    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    // This is the correct client-side logout.
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  };

  const value = { user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};