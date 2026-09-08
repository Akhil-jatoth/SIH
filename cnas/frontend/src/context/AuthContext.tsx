import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  username: string;
  role: 'Lead Investigator' | 'Senior Analyst' | 'Admin';
  badgeNumber: string;
  department: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('cnas_auth') === 'true';
  });

  const [user, setUser] = useState<User | null>(() => {
    const saved = sessionStorage.getItem('cnas_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const login = (username: string, password: string): boolean => {
    // Demo mock auth: accepts demo/demo or any investigator credentials
    if (
      (username.toLowerCase() === 'demo' && password === 'demo') ||
      (username.toLowerCase() === 'admin' && password === 'admin') ||
      (username.trim().length > 0 && password.trim().length > 0)
    ) {
      const authUser: User = {
        username: username || 'Investigator #4092',
        role: username.toLowerCase() === 'admin' ? 'Admin' : 'Lead Investigator',
        badgeNumber: 'IND-LE-8841',
        department: 'Special Cyber & Financial Crimes Division',
      };
      setIsAuthenticated(true);
      setUser(authUser);
      sessionStorage.setItem('cnas_auth', 'true');
      sessionStorage.setItem('cnas_user', JSON.stringify(authUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    sessionStorage.removeItem('cnas_auth');
    sessionStorage.removeItem('cnas_user');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
