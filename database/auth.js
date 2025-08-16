"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/database/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null); // "admin" | "buyer" | null
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  async function signup(email, password, username) {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) return { data, error };

    console.log("Signup data:", data);

    const { error: insertError } = await supabase.from("Buyer").insert({
      buyer_id: data.user.id,
      name: username,
      email: email,
    });

    if (insertError) {
      console.error("Buyer insert failed:", insertError.message);
    }

    return { data, error: null };
  }

  async function login(email, password) {
    try {
      console.log("Attempting to log in...");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Error during login:", error);
      } else {
        console.log("Login successful, data:", data);
      }

      setUser(data?.user || null);
      return { data, error };
    } catch (err) {
      console.error("Unexpected error during login:", err);
      return { data: null, error: err };
    }
  }

  async function signOut() {
    console.log("Signing out user...");
    console.log("Current session before sign out:", session);
    const { error } = await supabase.auth.signOut();
    console.log("Signing out...");
    if (error) {
      console.error("Error during sign out:", error);
    }
    setSession(null);
    setUser(null);
    setRole(null);
  }

  async function fetchRole(uidArg) {
    let uid = uidArg;
    if (!uid) {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        setRole(null);
        return;
      }
      uid = data.user.id;
    }

    const [
      { data: adminRow, error: adminErr },
      { data: buyerRow, error: buyerErr },
    ] = await Promise.all([
      supabase
        .from("Admin")
        .select("admin_id")
        .eq("admin_id", uid)
        .maybeSingle(),
      supabase
        .from("Buyer")
        .select("buyer_id")
        .eq("buyer_id", uid)
        .maybeSingle(),
    ]);

    if (adminErr || buyerErr) {
      setRole(null);
      return;
    }
    setRole(adminRow ? "admin" : buyerRow ? "buyer" : null);
  }

  useEffect(() => {
    let mounted = true;
    console.log("AuthProvider mounted, fetching session...");
    (async () => {
      console.log("Fetching session...");
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (!mounted) return;
      console.log("Session fetched:", session);
      if (error || !session) {
        setSession(null);
        setUser(null);
        setRole(null);
      } else {
        console.log("Session is valid, setting state...");
        setSession(session);
        setUser(session.user);
        await fetchRole(session.user.id);
      }
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_evt, sess) => {
        setSession(sess ?? null);
        setUser(sess?.user ?? null);
        await fetchRole(sess?.user?.id ?? null);
      }
    );

    return () => sub?.subscription?.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{ session, role, loading, signup, login, signOut, user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
