
import React, { createContext, ReactNode, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { User } from '../types';
import { voterService } from '../lib/data';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useLocalStorage<User | null>('voto-track-user', null);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      const users = await voterService.getUsers();
      const foundUser = users.find(
        u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
      );
      
      if (foundUser) {
        const { password: _, ...userToStore } = foundUser;
        setUser(userToStore as User);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  }, [setUser]);

  const logout = useCallback(() => {
    setUser(null);
  }, [setUser]);

  const value = { user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
