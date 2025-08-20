"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../database/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // "admin" | "buyer" | null
  const [loading, setLoading] = useState(true);

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
    if (!uid) return null;

    try {
      console.log(
        "[AuthProvider] Attempting to fetch role for admin user:",
        uid
      );
      const { data: a, error: e } = await supabase
        .from("Admin")
        .select("admin_id")
        .eq("admin_id", uid)
        .maybeSingle();
      console.log("[AuthProvider] Admin fetch result:", { a, e });
      if (!e && a) return "admin";

      const { data: b, error: er } = await supabase
        .from("Buyer")
        .select("buyer_id")
        .eq("buyer_id", uid)
        .maybeSingle();
      console.log("[AuthProvider] Buyer fetch result:", { b, er });
      if (!er && b) return "buyer";
    } catch (error) {
      console.error("[AuthProvider] fetchRole error:", error);
      return null;
    }
  }

  useEffect(() => {
    let alive = true;

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (event, sess) => {
        if (!alive) return;

        console.log("[AuthProvider] Auth state change:", { event, sess });

        setSession(sess ?? null);
        setUser(sess?.user ?? null);

        if (
          event === "INITIAL_SESSION" ||
          event === "SIGNED_IN" ||
          event === "USER_UPDATED"
        ) {
          try {
            const roleResult = await fetchRole(sess?.user?.id ?? null);
            if (alive) setRole(roleResult);
          } catch (e) {
            console.error("[AuthProvider] role fetch failed:", e);
          } finally {
            setLoading(false);
          }
        }

        if (event === "SIGNED_OUT") {
          setRole(null);
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
