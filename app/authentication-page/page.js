"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "../../database/auth";
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

  const { login, signup, session } = useAuth();

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
    
    const result = await signup(username, email, password);
    
    setIsProcessing(false);
    if (!result.success) {
      setError(result.error);
    } else {
      setSuccess(result.message);
      resetForm();
      // Switch to login tab after successful signup
      setTab("login");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError("");
    
    const result = await login(email, password);
    
    setIsProcessing(false);
    if (!result.success) {
      setError(result.error);
    } else {
      setSuccess("Login successful!");
      resetForm();
      router.push("/");
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError("");
    
    try {
      // Implement your admin login logic here
      console.log("Admin login attempt with:", adminId, password);
      // Example: const result = await adminLogin(adminId, password);
      
      setIsProcessing(false);
      setSuccess("Admin login successful!");
      resetForm();
      router.push("/admin");
    } catch (error) {
      setIsProcessing(false);
      setError("Invalid admin credentials");
    }
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
              className={`auth-tab ${tab === "signup" ? "active-tab" : "inactive-tab"}`}
            >
              Sign Up
            </button>
            <button
              onClick={() => {
                setTab("login");
                resetForm();
              }}
              className={`auth-tab ${tab === "login" ? "active-tab" : "inactive-tab"}`}
            >
              Log In
            </button>
            <button
              onClick={() => {
                setTab("admin");
                resetForm();
              }}
              className={`auth-tab ${tab === "admin" ? "active-tab" : "inactive-tab"}`}
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