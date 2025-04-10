"use client";
import { useState, useEffect, createContext, useContext } from 'react';
import supabase from './supabase';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setSession(session);
        }
      );

      return () => subscription?.unsubscribe();
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { success: true, user: data.user };
    } catch (error) {
      console.error("Login error:", error);
      return { 
        success: false, 
        error: "Invalid email or password" 
      };
    }
  };

  const signup = async (username, email, password) => {
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username }
        }
      });

      if (authError) throw authError;

      // 2. Insert into public.Users table
      const { error: dbError } = await supabase
        .from('Users')
        .insert({
          user_id: authData.user?.id,
          username,
          email,
          created_at: new Date().toISOString()
        });

      if (dbError) {
        // Attempt to delete auth user if DB insert fails
        try {
          if (authData.user?.id) {
            await supabase.auth.admin.deleteUser(authData.user.id);
          }
        } catch (deleteError) {
          console.error("Failed to rollback auth user:", deleteError);
        }
        throw dbError;
      }

      return { 
        success: true,
        user: authData.user,
        message: "Account created successfully! Please log in."
      };
    } catch (error) {
      console.error("Signup error:", error);
      let errorMessage = "Signup failed. Please try again.";
      
      if (/duplicate|already exists/i.test(error.message)) {
        errorMessage = "Email already registered";
      }

      return { success: false, error: errorMessage };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      loading, 
      login, 
      signup,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};