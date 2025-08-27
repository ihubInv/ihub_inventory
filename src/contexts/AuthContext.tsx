import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabaseClient';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { AuthToasts } from '../services/toastService';
import toast from 'react-hot-toast';
import { cancelAllApiRequests } from '../utils/api';

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
  const handleUserUpdate = async (supabaseUser: SupabaseUser) => {
    try {
      // Fetch user data from the users table to get complete profile information
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id);

      // Check if user exists (no error but empty result)
      if (error || !userData || userData.length === 0) {
        if (error) {
          console.error('Error fetching user data:', error);
        } else {
          console.log('User not found in users table, creating user record...');
        }
        
        // Create user record in users table
        const newUserData = {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name: (supabaseUser.user_metadata?.name as string) || supabaseUser.email?.split('@')[0] || 'User',
          role: ['admin', 'stock-manager', 'employee'].includes(supabaseUser.user_metadata?.role as string)
            ? (supabaseUser.user_metadata?.role as 'admin' | 'stock-manager' | 'employee')
            : 'employee',
          department: (supabaseUser.user_metadata?.department as string) || '',
          isactive: true,
          createdat: new Date().toISOString(),
          lastlogin: new Date().toISOString(),
        };

        try {
          const { data: createdUser, error: createError } = await supabase
            .from('users')
            .insert([newUserData])
            .select();

          if (createError) {
            console.error('Error creating user record:', createError);
            
            // If it's a duplicate key error, try to fetch the existing user
            if (createError.code === '23505') {
              console.log('User already exists, fetching existing user...');
              const { data: existingUser, error: fetchError } = await supabase
                .from('users')
                .select('*')
                .eq('id', supabaseUser.id);
              
              if (fetchError || !existingUser || existingUser.length === 0) {
                console.error('Failed to fetch existing user:', fetchError);
                // Fallback to basic user data
                const fallbackUserData: User = {
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
                setUser(fallbackUserData);
                setIsAuthenticated(true);
                localStorage.setItem('user', JSON.stringify(fallbackUserData));
                return;
              }
              
              // Use existing user data
              const userData = existingUser[0];
              const completeUserData: User = {
                id: userData.id,
                email: userData.email || supabaseUser.email || '',
                name: userData.name || (supabaseUser.user_metadata?.name as string) || '',
                role: ['admin', 'stock-manager', 'employee'].includes(userData.role)
                  ? (userData.role as 'admin' | 'stock-manager' | 'employee')
                  : 'employee',
                department: userData.department || '',
                isactive: userData.isactive ?? true,
                createdat: new Date(userData.createdat || supabaseUser.created_at),
                lastlogin: new Date(userData.lastlogin || supabaseUser.last_sign_in_at || new Date()),
                profilepicture: userData.profilepicture || null,
                phone: userData.phone || null,
                address: userData.address || null,
                bio: userData.bio || null,
              };
              
              setUser(completeUserData);
              console.log("User data loaded from existing record:", completeUserData);
              setIsAuthenticated(true);
              localStorage.setItem('user', JSON.stringify(completeUserData));
              return;
            }
            
            // Other create errors - fallback to basic user data
            const fallbackUserData: User = {
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
            setUser(fallbackUserData);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(fallbackUserData));
            return;
          }

          console.log('User record created successfully:', createdUser);
          
          // Use the created user data
          const userData = createdUser[0];
          const completeUserData: User = {
            id: userData.id,
            email: userData.email || supabaseUser.email || '',
            name: userData.name || (supabaseUser.user_metadata?.name as string) || '',
            role: ['admin', 'stock-manager', 'employee'].includes(userData.role)
              ? (userData.role as 'admin' | 'stock-manager' | 'employee')
              : 'employee',
            department: userData.department || '',
            isactive: userData.isactive ?? true,
            createdat: new Date(userData.createdat || supabaseUser.created_at),
            lastlogin: new Date(userData.lastlogin || supabaseUser.last_sign_in_at || new Date()),
            profilepicture: userData.profilepicture || null,
            phone: userData.phone || null,
            address: userData.address || null,
            bio: userData.bio || null,
          };

          setUser(completeUserData);
          console.log("User data loaded after creation:", completeUserData);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(completeUserData));
          return;
        } catch (createError) {
          console.error('Error in user creation process:', createError);
          // Fallback to basic user data from auth
          const fallbackUserData: User = {
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
          setUser(fallbackUserData);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(fallbackUserData));
          return;
        }
      }

      // Use data from users table with proper type conversion
      const userRecord = userData[0]; // Get the first (and only) result
      const completeUserData: User = {
        id: userRecord.id,
        email: userRecord.email || supabaseUser.email || '',
        name: userRecord.name || (supabaseUser.user_metadata?.name as string) || '',
        role: ['admin', 'stock-manager', 'employee'].includes(userRecord.role)
          ? (userRecord.role as 'admin' | 'stock-manager' | 'employee')
          : 'employee',
        department: userRecord.department || '',
        isactive: userRecord.isactive ?? true,
        createdat: new Date(userRecord.createdat || supabaseUser.created_at),
        lastlogin: new Date(userRecord.lastlogin || supabaseUser.last_sign_in_at || new Date()),
        profilepicture: userRecord.profilepicture || null,
        phone: userRecord.phone || null,
        address: userRecord.address || null,
        bio: userRecord.bio || null,
      };

      console.log('Raw userData from database:', userData);
      console.log('Profile picture from database:', userRecord.profilepicture);

      setUser(completeUserData);
      console.log("User data loaded:", completeUserData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(completeUserData));
    } catch (error) {
      console.error('Error in handleUserUpdate:', error);
      // Fallback to basic user data
      const fallbackUserData: User = {
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
      setUser(fallbackUserData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(fallbackUserData));
    }
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

      // Wait for user data to be properly loaded before returning success
      await handleUserUpdate(supabaseUser);
      return { success: true };
    } catch (err) {
      console.error('Unexpected login error:', err);
      return { success: false, error: 'Login failed. Please try again later.' };
    }
  };

  const logout = async () => {
    const loadingToast = AuthToasts.loggingOut();
    try {
      // Cancel all pending API requests
      cancelAllApiRequests();
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        toast.dismiss(loadingToast);
        AuthToasts.logoutError(error.message);
      } else {
        // Clear all local data
        setUser(null);
        setIsAuthenticated(false);
        setSession(null);
        localStorage.removeItem('user');
        localStorage.clear(); // Clear all localStorage
        sessionStorage.clear(); // Clear all sessionStorage
        
        // Clear service worker cache if exists
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
        }
        
        // Clear IndexedDB if used by Supabase
        if ('indexedDB' in window) {
          indexedDB.databases().then(databases => {
            databases.forEach(db => {
              indexedDB.deleteDatabase(db.name!);
            });
          }).catch(console.error);
        }
        
        // Show success message
        toast.dismiss(loadingToast);
        AuthToasts.logoutSuccess();
        
        // Force reload to clear all network activity and memory
        // This ensures a complete clean slate
        setTimeout(() => {
          window.location.replace('/login'); // Use replace to prevent back navigation
        }, 500);
      }
    } catch (err) {
      console.error('Logout error:', err);
      toast.dismiss(loadingToast);
      AuthToasts.logoutError('An unexpected error occurred');
    }
  };

  // const updateUser = async (userData: Partial<User>) => {
  //   if (user) {
  //     const updatedUser = { ...user, ...userData };
  //     setUser(updatedUser);
  //     localStorage.setItem('user', JSON.stringify(updatedUser));

  //     // const { error } = await supabase.auth.updateUser({
  //     //   data: userData,
  //     // });

  //     const {  error } = await supabase
  //       .from("users")
  //       .update(userData)
  //       .eq("id", user.id)
  //       .select()
  //       .single();

  //     if (error) {
  //       console.error('User update error:', error);
  //     }
  //   }
  // };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;
    
    console.log('Updating user with data:', userData);
    console.log('User ID:', user.id);
    
    try {
      // First, update the user data
      const { error: updateError } = await supabase
        .from("users")
        .update(userData)
        .eq("id", user.id);
  
      if (updateError) {
        console.error('Database update error:', updateError);
        if (updateError.message?.includes('row-level security policy')) {
          throw new Error('RLS policy violation - database permissions need to be updated');
        }
        throw updateError;
      }

      console.log('User update successful, fetching updated data...');
  
      // Then fetch the updated user data
      console.log('Fetching updated user data for ID:', user.id);
      const { data, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id);
  
      if (fetchError) {
        console.error('Error fetching updated user:', fetchError);
        throw fetchError;
      }
  
      console.log('Fetch result:', { data, dataLength: data?.length });
  
      if (data && data.length > 0) {
        const userData = data[0]; // Get the first (and only) result
        console.log('User updated successfully:', userData);
        
        // Convert the database data to our User type
        const updatedUser: User = {
          id: userData.id,
          email: userData.email || '',
          name: userData.name || '',
          role: ['admin', 'stock-manager', 'employee'].includes(userData.role)
            ? (userData.role as 'admin' | 'stock-manager' | 'employee')
            : 'employee',
          department: userData.department || '',
          isactive: userData.isactive ?? true,
          createdat: new Date(userData.createdat),
          lastlogin: new Date(userData.lastlogin || new Date()),
          profilepicture: userData.profilepicture || null,
          phone: userData.phone || null,
          address: userData.address || null,
          bio: userData.bio || null,
        };
        
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else {
        console.error('No user data returned after update');
        console.error('User ID being searched:', user.id);
        console.error('Data returned:', data);
        
        // Try to fetch the user again with a different approach
        console.log('Trying alternative fetch method...');
        const { data: altData, error: altError } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .limit(1);
        
        console.log('Alternative fetch result:', { altData, altError });
        
        if (altData && altData.length > 0) {
          const userData = altData[0];
          console.log('Alternative fetch successful:', userData);
          
          const updatedUser: User = {
            id: userData.id,
            email: userData.email || '',
            name: userData.name || '',
            role: ['admin', 'stock-manager', 'employee'].includes(userData.role)
              ? (userData.role as 'admin' | 'stock-manager' | 'employee')
              : 'employee',
            department: userData.department || '',
            isactive: userData.isactive ?? true,
            createdat: new Date(userData.createdat),
            lastlogin: new Date(userData.lastlogin || new Date()),
            profilepicture: userData.profilepicture || null,
            phone: userData.phone || null,
            address: userData.address || null,
            bio: userData.bio || null,
          };
          
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
        } else {
          throw new Error(`No user data returned after update. User ID: ${user.id}, Data: ${JSON.stringify(data)}`);
        }
      }
    } catch (err) {
      console.error("User update error:", err);
      throw err; // Re-throw to let the calling function handle it
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
