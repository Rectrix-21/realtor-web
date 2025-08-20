"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../database/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // "admin" | "buyer" | null
  const [loading, setLoading] = useState(true);

  // Cache the last resolved role for a specific user id
  const cachedRoleRef = useRef({ userId: null, role: null });

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
    cachedRoleRef.current = { userId: null, role: null };
  }

  async function fetchRole(uid) {
    if (!uid) return null;
    try {
      const { data: a, error: e } = await supabase
        .from("Admin")
        .select("admin_id")
        .eq("admin_id", uid)
        .maybeSingle();
      if (!e && a) return "admin";

      const { data: b, error: er } = await supabase
        .from("Buyer")
        .select("buyer_id")
        .eq("buyer_id", uid)
        .maybeSingle();
      if (!er && b) return "buyer";
    } catch (error) {
      console.error("[AuthProvider] fetchRole error:", error);
    }
    return null;
  }

  useEffect(() => {
    let alive = true;

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (event, sess) => {
        if (!alive) return;

        setSession(sess ?? null);
        setUser(sess?.user ?? null);

        const uid = sess?.user?.id ?? null;

        if (
          event === "INITIAL_SESSION" ||
          event === "SIGNED_IN" ||
          event === "USER_UPDATED"
        ) {
          // If same user as last time and we already have their role, reuse it.
          if (
            uid &&
            cachedRoleRef.current.userId === uid &&
            cachedRoleRef.current.role != null
          ) {
            console.log("[AuthProvider] Using cached role for user:", uid);
            console.log(
              "[AuthProvider] Cached role:",
              cachedRoleRef.current.role
            );
            setRole(cachedRoleRef.current.role);
            setLoading(false);
            return;
          }

          // Otherwise fetch once and cache
          try {
            const roleResult = await fetchRole(uid);
            if (!alive) return;
            setRole(roleResult);
            cachedRoleRef.current = { userId: uid, role: roleResult };
          } catch (e) {
            console.error("[AuthProvider] role fetch failed:", e);
            if (!alive) return;
            setRole(null);
            cachedRoleRef.current = { userId: uid, role: null };
          } finally {
            setLoading(false);
          }
        }

        if (event === "SIGNED_OUT") {
          setRole(null);
          cachedRoleRef.current = { userId: null, role: null };
          setLoading(false);
        }
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
