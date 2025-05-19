import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Optionally restore user from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // Decode or validate token with backend in future
      // For now, assume valid and stay logged in
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

