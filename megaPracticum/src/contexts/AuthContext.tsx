import { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = (userData: User, token: string) => {
    // Ensure all user fields are included
    const fullUser: User = {
      _id: userData._id,
      username: userData.username,
      role: userData.role,
      tenant: userData.tenant,
      uvuId: userData.uvuId,
      uofuId: userData.uofuId
    };

    console.log('Setting user data:', fullUser);
    setUser(fullUser);
    localStorage.setItem('user', JSON.stringify(fullUser));
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
      <AuthContext.Provider value={{
        user,
        login,
        logout,
        isAuthenticated: !!user
      }}>
        {children}
      </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}