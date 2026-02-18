import React, { createContext, useState, useEffect } from 'react';
import client from '../api/client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Auth State
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user_profile');

    if (token && storedUser) {
       client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
       // Legacy support or just using the user ID for data partitioning
       const userObj = JSON.parse(storedUser);
       client.defaults.headers.common['x-user-id'] = userObj.id; 
       setUser(userObj);
    }
    setLoading(false);
  }, []);

  // Login Function (Email/Password)
  const login = async (email, password) => {
    try {
      const response = await client.post('/api/auth/login', { email, password });
      const { access_token, user_id, user_name } = response.data;
      
      // Store Token
      localStorage.setItem('access_token', access_token);
      client.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Store User Profile
      const userObj = { id: user_id, name: user_name, email };
      localStorage.setItem('user_profile', JSON.stringify(userObj));
      
      // Keep x-user-id for backward compatibility with existing backend logic
      localStorage.setItem('x-user-id', user_id);
      client.defaults.headers.common['x-user-id'] = user_id;

      setUser(userObj);
      return { success: true };
    } catch (error) {
      console.error("Login failed", error);
      let msg = "Login failed. Please check your credentials.";
      if (error.response?.data?.detail) {
          msg = error.response.data.detail;
      } else if (error.message) {
          msg = `${error.message}. (Check Console)`;
      }
      return { success: false, message: msg };
    }
  };

  // Register Function
  const register = async (email, password, fullName) => {
      try {
        const response = await client.post('/api/auth/register', { 
            email, 
            password, 
            full_name: fullName 
        });
        
        const { access_token, user_id, user_name } = response.data;
        
        // Auto-login after register
        localStorage.setItem('access_token', access_token);
        client.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        
        const userObj = { id: user_id, name: user_name, email };
        localStorage.setItem('user_profile', JSON.stringify(userObj));
        localStorage.setItem('x-user-id', user_id);
        client.defaults.headers.common['x-user-id'] = user_id;
        
        setUser(userObj);
        return { success: true };
      } catch (error) {
          console.error("Registration failed", error);
          let msg = "Registration failed.";
          if (error.response?.data?.detail) {
              msg = error.response.data.detail;
          } else if (error.message) {
              msg = `${error.message}. (Check Console)`;
          }
          return { success: false, message: msg };
      }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_profile');
    localStorage.removeItem('x-user-id');
    delete client.defaults.headers.common['Authorization'];
    delete client.defaults.headers.common['x-user-id'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
