import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabaseClient';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { AuthToasts } from '../services/toastService';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  loading: boolean; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const handleUserUpdate = (supabaseUser: SupabaseUser) => {
    const userData: User = {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: (supabaseUser.user_metadata?.name as string) || '',
      role: ['admin', 'stock-manager', 'employee'].includes(supabaseUser.user_metadata?.role as string)
        ? (supabaseUser.user_metadata?.role as 'admin' | 'stock-manager' | 'employee')
        : 'employee',
      department: (supabaseUser.user_metadata?.department as string) || '',
      isactive: true,
      createdat: new Date(supabaseUser.created_at),
      lastlogin: new Date(supabaseUser.last_sign_in_at ?? new Date()),
    };

    setUser(userData);
    console.log("555",userData)
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
  };


  useEffect(() => {
    const localUser = localStorage.getItem('user');
    if (localUser) {
      try {
        const parsedUser = JSON.parse(localUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (err) {
        localStorage.removeItem('user');
      }
    }
  
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      setSession(session ?? null);
  
      if (session?.user) {
        handleUserUpdate(session.user);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
      }
  
      setLoading(false); // ✅ Done loading
    };
  
    getSession();
  
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setSession(session);
        if (session?.user) {
          handleUserUpdate(session.user);
          setIsAuthenticated(true);
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
      }
    });
  
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        return {
          success: false,
          error: error.code === 'email_not_confirmed'
            ? 'Email not confirmed. Please verify your email.'
            : `Login failed: ${error.message}`,
        };
      }

      const supabaseUser = data?.user;
      if (!supabaseUser) {
        return { success: false, error: 'User not found in response' };
      }

      handleUserUpdate(supabaseUser);
      return { success: true };
    } catch (err) {
      console.error('Unexpected login error:', err);
      return { success: false, error: 'Login failed. Please try again later.' };
    }
  };

  const logout = async () => {
    const loadingToast = AuthToasts.loggingOut();
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        toast.dismiss(loadingToast);
        AuthToasts.logoutError(error.message);
      } else {
        toast.dismiss(loadingToast);
        AuthToasts.logoutSuccess();
      }
    } catch (err) {
      console.error('Logout error:', err);
      toast.dismiss(loadingToast);
      AuthToasts.logoutError('An unexpected error occurred');
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      const { error } = await supabase.auth.updateUser({
        data: userData,
      });

      if (error) {
        console.error('User update error:', error);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        updateUser,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
