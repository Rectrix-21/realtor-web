"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../database/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // "admin" | "buyer" | null
  const [loading, setLoading] = useState(true); // stays true until role is known

  async function signup(email, password, username) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (!error) {
      await supabase.from("Buyer").insert({
        buyer_id: data.user.id,
        name: username,
        email,
      });
    }
    return { data, error };
  }

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setUser(data?.user ?? null);
    return { data, error };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setRole(null);
  }

  async function fetchRole(uid) {
    if (!uid) {
      setRole(null);
      return;
    }
    const [{ data: a }, { data: b }] = await Promise.all([
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
    setRole(a ? "admin" : b ? "buyer" : null);
  }

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);

      // Restore session on first mount
      const { data: sessData } = await supabase.auth.getSession();
      const sess = sessData?.session ?? null;

      if (!alive) return;
      setSession(sess);
      setUser(sess?.user ?? null);

      // Fetch role for restored session (if any)
      await fetchRole(sess?.user?.id ?? null);

      if (!alive) return;
      setLoading(false);
    })();

    // Keep role in sync with future auth changes
    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_evt, sess) => {
        setSession(sess ?? null);
        setUser(sess?.user ?? null);
        await fetchRole(sess?.user?.id ?? null);
      }
    );

    return () => {
      alive = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ session, user, role, loading, signup, login, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
