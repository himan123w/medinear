import { createContext, useState, useContext, useEffect } from 'react';
import { safeStorage, getToken, setToken, removeToken, getUser, setUser, clearAuth } from './utils/safeStorage';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [token, setTokenState] = useState(getToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user data exists in storage
    const storedUser = getUser();
    if (storedUser && token) {
      setUserState(storedUser);
    } else if (!token) {
      // No token means not logged in
      setUserState(null);
    }
    setLoading(false);
  }, [token]);

  const login = (userData, authToken) => {
    setUserState(userData);
    setTokenState(authToken);
    setToken(authToken);
    setUser(userData);
  };

  const logout = () => {
    setUserState(null);
    setTokenState(null);
    clearAuth();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
