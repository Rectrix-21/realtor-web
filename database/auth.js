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
    
    try {
      // Add timeout for database queries as well
      const fetchWithTimeout = Promise.race([
        Promise.all([
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
        ]),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('fetchRole timeout')), 3000)
        )
      ]);

      const [{ data: a }, { data: b }] = await fetchWithTimeout;
      return a ? "admin" : b ? "buyer" : null;
    } catch (error) {
      console.error("[AuthProvider] fetchRole error:", error);
      return null; // Return null on error rather than throwing
    }
  }

  useEffect(() => {
    let alive = true;
    let timeoutId;

    // Function to handle timeout for getSession
    const getSessionWithTimeout = () => {
      return Promise.race([
        supabase.auth.getSession(),
        new Promise((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error('getSession timeout after 5 seconds'));
          }, 5000);
        })
      ]);
    };

    // Function to clear timeout
    const clearSessionTimeout = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    (async () => {
      try {
        console.log("[AuthProvider] calling supabase.auth.getSession()");
        
        // Try to get session with timeout
        const { data, error } = await getSessionWithTimeout();
        clearSessionTimeout();
        
        console.log("data:", data);
        console.log("Checking alive:", alive);
        if (!alive) return;

        if (error) {
          console.error("[AuthProvider] getSession error:", error);
          // Set default values and continue
          setSession(null);
          setUser(null);
          setRole(null);
        } else {
          console.log("[AuthProvider] getSession data:", data);
          
          const sess = data?.session ?? null;
          setSession(sess);
          setUser(sess?.user ?? null);

          // Only fetch role if we have a valid session
          if (sess?.user?.id) {
            try {
              const roleResult = await fetchRole(sess.user.id);
              if (!alive) return;
              setRole(roleResult ?? null);
            } catch (roleError) {
              console.error("[AuthProvider] fetchRole error:", roleError);
              if (!alive) return;
              setRole(null);
            }
          } else {
            setRole(null);
          }
        }
      } catch (e) {
        console.error("[AuthProvider] getSession threw:", e);
        clearSessionTimeout();
        if (!alive) return;
        
        // If getSession fails (including timeout), set default values
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
          // update role quietly with error handling
          try {
            const roleResult = await fetchRole(sess?.user?.id ?? null);
            if (alive) setRole(roleResult ?? null);
          } catch (roleError) {
            console.error("[AuthProvider] Error fetching role on auth change:", roleError);
            if (alive) setRole(null);
          }
        }

        if (event === "SIGNED_OUT") {
          setRole(null);
        }
      }
    );

    return () => {
      alive = false;
      clearSessionTimeout(); // Clear any pending timeout
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
