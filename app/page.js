"use client";

/* run npm install @heroicons/react */

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import "./styles.css";
import { useAuth } from "../database/auth";
import ProfileBanner from "../components/ProfileBanner";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Home() {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [propertiesOpen, setPropertiesOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { role, user, loading } = useAuth();
  const router = useRouter();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state until both mounted and auth is loaded
  if (!mounted || loading) {
    return <LoadingSpinner />;
  }

  const handleDropdownItemClick = (e, item) => {
    e.stopPropagation();
    console.log(`${item} clicked`);
  };

  console.log("role is", role);
  console.log("user is", user);

  return (
    <div className="container">
      {/* Background Image */}
      <Image
        src="/images/home.jpg"
        alt="Luxury Interior"
        fill
        style={{ objectFit: "cover" }}
        className="bg-image"
      />

      {/* Dark Overlay */}
      <div className="overlay"></div>

      {/* Logo */}
      <div
        className="logo"
        onClick={() => router.push("/")}
        style={{ cursor: "pointer" }}
      >
        <img src="/images/logo/logo.png" alt="Havenly Logo" />
      </div>

      {user ? (
        <div className="signup-btn">
          <ProfileBanner />
        </div>
      ) : (
        <div className="signup-btn">
          <Link href="/authentication-page">
            <button className="custom-button-home">Sign Up</button>
          </Link>
        </div>
      )}

      {/* Navbar */}
      <nav className="navbar">
        <ul className="navbar-ul">
          <li className="navbar-li">
            <Link href="/">Home</Link>
          </li>
          <li className="navbar-li">
            <Link href="/contact">About</Link>
          </li>
          <li className="navbar-li">
            <Link href="/view-listings">Properties</Link>
          </li>
          {user && (
            <li className="navbar-li">
              <Link href="/saved-properties">Saved</Link>
            </li>
          )}
          <li className="navbar-li">
            <Link href="/careers">Career opportunity</Link>
          </li>
          {user && role === "buyer" && (
            <li className="navbar-li">
              <Link href="/my-applications">My Applications</Link>
            </li>
          )}
          {user && role === "admin" && (
            <li className="navbar-li">
              <Link href="/admin-dashboard">Admin Dashboard</Link>
            </li>
          )}
        </ul>
      </nav>

      {/* Main Content */}
      <div className="main-content">
        <h1>
          <span className="light-text">Havenly</span>
        </h1>
        <p className="subtitle">Turning Your Vision Of The Perfect Home</p>

        {/* Search Bar */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search property by Location or Postal code..."
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="view-listings">
          <Link href="/view-listings">
            <button className="custom-button-home view-button">
              View Listings
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
