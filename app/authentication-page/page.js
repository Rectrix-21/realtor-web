"use client";

{
  /* run npm install @heroicons/react */
}

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import "./styles.css";

export default function Authenticate() {
  const [tab, setTab] = useState("signup");

  return (
    <div className="auth-container">
      {/* Background Image */}
      <Image
        src="/images/sign-up.jpg"
        alt="Luxury Interior"
        fill
        style={{ objectFit: "cover" }}
        className="auth-bg-image"
      />

      {/* Dark Overlay */}
      <div className="auth-overlay"></div>

      <div className="auth-inner-container">
        <div className="auth-form-box">
          <h1 className="auth-heading">Welcome to Havenly</h1>

          {/* Authentication Tabs */}
          <div className="auth-tabs">
            <button
              onClick={() => setTab("signup")}
              className={`auth-tab ${
                tab === "signup" ? "active-tab" : "inactive-tab"
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => setTab("login")}
              className={`auth-tab ${
                tab === "login" ? "active-tab" : "inactive-tab"
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => setTab("admin")}
              className={`auth-tab ${
                tab === "admin" ? "active-tab" : "inactive-tab"
              }`}
            >
              Admin Login
            </button>
          </div>

          {/* Forms */}
          {tab === "signup" && (
            <div className="auth-form">
              <input
                type="text"
                placeholder="Username"
                className="input-field"
              />
              <input type="email" placeholder="Email" className="input-field" />
              <input
                type="password"
                placeholder="Password"
                className="input-field"
              />
              <button className="auth-custom-button">Sign Up</button>
            </div>
          )}

          {tab === "login" && (
            <div className="auth-form">
              <input type="email" placeholder="Email" className="input-field" />
              <input
                type="password"
                placeholder="Password"
                className="input-field"
              />
              <button className="auth-custom-button">Log In</button>
            </div>
          )}

          {tab === "admin" && (
            <div className="auth-form">
              <input
                type="text"
                placeholder="Admin ID"
                className="input-field"
              />
              <input
                type="password"
                placeholder="Password"
                className="input-field"
              />
              <button className="auth-custom-button">Admin Login</button>
            </div>
          )}

          {/* Back to Home */}
          <Link href="/" className="back-home-link">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
