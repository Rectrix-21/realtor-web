"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import "./styles.css";

export default function Authenticate() {
  const router = useRouter();
  const [tab, setTab] = useState("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [adminId, setAdminId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setUsername("");
    setAdminId("");
    setError("");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError("");

    // Simple validation for now (will be replaced with Supabase later)
    if (!username || !email || !password) {
      setError("Please fill in all fields");
      setIsProcessing(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsProcessing(false);
      return;
    }

    // Simulate signup success
    setTimeout(() => {
      setIsProcessing(false);
      setSuccess("Account created successfully! Please log in.");
      resetForm();
      setTab("login");
    }, 1000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError("");

    // Simple validation for now (will be replaced with Supabase later)
    if (!email || !password) {
      setError("Please fill in all fields");
      setIsProcessing(false);
      return;
    }

    // Simulate login
    setTimeout(() => {
      setIsProcessing(false);
      setSuccess("Login successful!");

      // Redirect to home page after login
      setTimeout(() => {
        router.push("/");
      }, 1000);
    }, 1000);
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError("");

    // Simple validation for now (will be replaced with Supabase later)
    if (!adminId || !password) {
      setError("Please fill in all fields");
      setIsProcessing(false);
      return;
    }

    // Simulate admin login
    setTimeout(() => {
      setIsProcessing(false);
      setSuccess("Admin login successful!");
      resetForm();
      router.push("/admin-dashboard");
    }, 1000);
  };

  return (
    <div className="auth-container">
      <Image
        src="/images/sign-up.jpg"
        alt="Luxury Interior"
        fill
        style={{ objectFit: "cover" }}
        className="auth-bg-image"
        priority
      />

      <div className="auth-overlay"></div>

      <div className="auth-inner-container">
        <div className="auth-form-box">
          <h1 className="auth-heading">Welcome to Havenly</h1>

          <div className="auth-tabs">
            <button
              onClick={() => {
                setTab("signup");
                resetForm();
              }}
              className={`auth-tab ${
                tab === "signup" ? "active-tab" : "inactive-tab"
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => {
                setTab("login");
                resetForm();
              }}
              className={`auth-tab ${
                tab === "login" ? "active-tab" : "inactive-tab"
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => {
                setTab("admin");
                resetForm();
              }}
              className={`auth-tab ${
                tab === "admin" ? "active-tab" : "inactive-tab"
              }`}
            >
              Admin Login
            </button>
          </div>

          {error && (
            <div className="auth-error">
              <p>{error}</p>
            </div>
          )}
          {success && (
            <div className="auth-success">
              <p>{success}</p>
            </div>
          )}

          {tab === "signup" && (
            <form onSubmit={handleSignup} className="auth-form">
              <input
                type="text"
                placeholder="Username"
                className="input-field"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                maxLength={20}
              />
              <input
                type="email"
                placeholder="Email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password (min 6 characters)"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="submit"
                className="auth-custom-button"
                disabled={isProcessing}
              >
                {isProcessing ? "Creating Account..." : "Sign Up"}
              </button>
            </form>
          )}

          {tab === "login" && (
            <form onSubmit={handleLogin} className="auth-form">
              <input
                type="email"
                placeholder="Email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="submit"
                className="auth-custom-button"
                disabled={isProcessing}
              >
                {isProcessing ? "Logging In..." : "Log In"}
              </button>
            </form>
          )}

          {tab === "admin" && (
            <form onSubmit={handleAdminLogin} className="auth-form">
              <input
                type="text"
                placeholder="Admin ID"
                className="input-field"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="submit"
                className="auth-custom-button"
                disabled={isProcessing}
              >
                {isProcessing ? "Verifying..." : "Admin Login"}
              </button>
            </form>
          )}

          <Link href="/" className="back-home-link">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
