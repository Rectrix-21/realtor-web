"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../database/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // "admin" | "buyer" | null
  const [loading, setLoading] = useState(true);

  console.log("user:", user);
  console.log("role:", role);

  console.log("loading:", loading);
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
    return a ? "admin" : b ? "buyer" : null;
  }

  function withTimeout(promise, ms, label = "operation") {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error(`${label} timed out after ${ms}ms`)),
          ms
        )
      ),
    ]);
  }

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        console.log("[AuthProvider] calling supabase.auth.getSession()ss");
        const { data, error } = await withTimeout(
          supabase.auth.getSession(),
          5000,
          "getSession"
        );
        console.log("data:", data);
        console.log("Checking alive:", alive);
        if (!alive) return;

        if (error) {
          console.error("[AuthProvider] getSession error:", error);
        } else {
          console.log("[AuthProvider] getSession data:", data);
        }

        const sess = data?.session ?? null;
        setSession(sess);
        setUser(sess?.user ?? null);

        // Guard and timeout role fetch to avoid hanging UI
        if (sess?.user?.id) {
          console.log("[AuthProvider] Fetching role for UID:", sess.user.id);
          try {
            const role = await withTimeout(
              fetchRole(sess.user.id),
              5000,
              "fetchRole"
            );
            setRole(role);
          } catch (e) {
            console.error("[AuthProvider] fetchRole failed:", e);
            setRole(null);
          }
        } else {
          setRole(null);
        }
      } catch (e) {
        console.error("[AuthProvider] getSession threw:", e);
        setSession(null);
        setUser(null);
        setRole(null);
      } finally {
        if (!alive) return;
        setLoading(false);
        console.log("[AuthProvider] effect done");
      }
    })();

    // 2) Listen for later changes
    const { data: sub } = supabase.auth.onAuthStateChange(
      async (event, sess) => {
        if (!alive) return;

        setSession(sess ?? null);
        setUser(sess?.user ?? null);

        if (
          event === "SIGNED_IN" ||
          event === "USER_UPDATED" ||
          event === "TOKEN_REFRESHED"
        ) {
          // update role quietly
          const roleResult = await fetchRole(sess?.user?.id ?? null);
          if (alive) setRole(roleResult ?? null);
        }

        if (event === "SIGNED_OUT") {
          setRole(null);
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
