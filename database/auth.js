"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../database/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // "admin" | "buyer" | null
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null); // Store user profile info

  // Helper functions for persistent cache
  const getCachedData = (userId) => {
    if (typeof window === "undefined") return null;
    try {
      const cached = localStorage.getItem(`havenly-user-${userId}`);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  };

  const setCachedData = (userId, role, profile) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        `havenly-user-${userId}`,
        JSON.stringify({
          role,
          profile,
          timestamp: Date.now(),
        })
      );
    } catch (e) {
      console.warn("Failed to cache user data:", e);
    }
  };

  const clearCachedData = (userId = null) => {
    if (typeof window === "undefined") return;
    try {
      if (userId) {
        localStorage.removeItem(`havenly-user-${userId}`);
      } else {
        // Clear all user cache
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("havenly-user-")) {
            localStorage.removeItem(key);
          }
        });
      }
    } catch (e) {
      console.warn("Failed to clear user cache:", e);
    }
  };

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
    try {
      console.log("[AuthProvider] Starting sign out process");

      // Clear cached data for current user
      if (user?.id) {
        clearCachedData(user.id);
      }

      // Clear state immediately BEFORE calling Supabase
      setSession(null);
      setUser(null);
      setRole(null);
      setUserProfile(null);
      setLoading(false);

      // Call Supabase signOut with scope: 'global' to ensure complete logout
      const { error } = await supabase.auth.signOut({ scope: "global" });

      if (error) {
        console.error("[AuthProvider] Supabase signOut error:", error);
      } else {
        console.log("[AuthProvider] Supabase signOut successful");
      }

      // Force clear local storage to ensure complete logout
      if (typeof window !== "undefined") {
        localStorage.removeItem("supabase.auth.token");
        localStorage.removeItem(
          "sb-" +
            process.env.NEXT_PUBLIC_SUPABASE_URL?.split("//")[1]?.split(
              "."
            )[0] +
            "-auth-token"
        );
        clearCachedData(); // Clear all user cache
        sessionStorage.clear();
      }

      console.log("[AuthProvider] Sign out completed successfully");

      // Force page reload to ensure clean state
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("[AuthProvider] signOut error:", error);
      // Clear state even if signOut fails
      setSession(null);
      setUser(null);
      setRole(null);
      setUserProfile(null);
      setLoading(false);
      clearCachedData();

      // Force clear storage even on error
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/";
      }
    }
  }

  async function fetchRole(uid) {
    if (!uid) return null;
    try {
      const { data: a, error: e } = await supabase
        .from("Admin")
        .select("admin_id")
        .eq("admin_id", uid)
        .maybeSingle();
      if (!e && a) {
        setCachedData(uid, "admin", null);
        return "admin";
      }

      const { data: b, error: er } = await supabase
        .from("Buyer")
        .select("buyer_id, name, email")
        .eq("buyer_id", uid)
        .maybeSingle();
      if (!er && b) {
        // Cache the user profile data
        setUserProfile(b);
        setCachedData(uid, "buyer", b);
        return "buyer";
      }
    } catch (error) {
      console.error("[AuthProvider] fetchRole error:", error);
    }
    return null;
  }

  useEffect(() => {
    let alive = true;
    let timeoutId;

    // Set a timeout to prevent infinite loading states
    const setupTimeout = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (alive) {
          console.warn(
            "[AuthProvider] Timeout reached, forcing loading to false"
          );
          setLoading(false);
        }
      }, 3000); // Reduced to 3 seconds for faster loading
    };

    setupTimeout();

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (event, sess) => {
        if (!alive) return;

        console.log(
          "[AuthProvider] Auth event:",
          event,
          "Session:",
          !!sess,
          "User ID:",
          sess?.user?.id
        );

        // Clear timeout when we get an auth event
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        // Always update session and user first
        setSession(sess ?? null);
        setUser(sess?.user ?? null);

        const uid = sess?.user?.id ?? null;

        if (event === "SIGNED_OUT") {
          console.log(
            "[AuthProvider] Processing SIGNED_OUT - clearing all state"
          );
          setRole(null);
          setUserProfile(null);
          if (user?.id) {
            clearCachedData(user.id);
          }
          setLoading(false);
          return;
        }

        if (
          event === "INITIAL_SESSION" ||
          event === "SIGNED_IN" ||
          event === "USER_UPDATED"
        ) {
          if (!uid) {
            console.log(
              "[AuthProvider] No user session - setting loading to false"
            );
            setRole(null);
            setUserProfile(null);
            setLoading(false);
            return;
          }

          // Check persistent cache first
          const cachedData = getCachedData(uid);
          if (cachedData && cachedData.role) {
            console.log(
              "[AuthProvider] Using cached data for user:",
              uid,
              "Role:",
              cachedData.role
            );
            setRole(cachedData.role);
            if (cachedData.profile) {
              setUserProfile(cachedData.profile);
            }
            setLoading(false);
            return;
          }

          // Fetch role with timeout protection if not cached
          setupTimeout();

          try {
            console.log("[AuthProvider] Fetching role for user:", uid);
            const roleResult = await fetchRole(uid);
            if (!alive) return;

            console.log(
              "[AuthProvider] Role fetched successfully:",
              roleResult
            );
            setRole(roleResult);
          } catch (e) {
            console.error("[AuthProvider] role fetch failed:", e);
            if (!alive) return;
            setRole(null);
            setUserProfile(null);
            clearCachedData(uid);
          }

          // Always clear loading after processing
          if (alive) {
            if (timeoutId) clearTimeout(timeoutId);
            console.log(
              "[AuthProvider] Setting loading to false after role processing"
            );
            setLoading(false);
          }
        }
      }
    );

    return () => {
      alive = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      sub?.subscription?.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        role,
        userProfile,
        loading,
        signup,
        login,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
