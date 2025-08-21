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
        <Image
          src="/images/logo/logo.png"
          alt="Havenly Logo"
          width={300}
          height={80}
        />
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
        {/* Desktop Navigation */}
        <ul className="navbar-ul desktop-nav">
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
            <Link href="/careers">Career Opportunity</Link>
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

      {/* Simple Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        <Link href="/" className="mobile-nav-item">
          <span>Home</span>
        </Link>
        <Link href="/contact" className="mobile-nav-item">
          <span>About</span>
        </Link>
        <Link href="/view-listings" className="mobile-nav-item">
          <span>Properties</span>
        </Link>
        {user && (
          <Link href="/saved-properties" className="mobile-nav-item">
            <span>Saved</span>
          </Link>
        )}
        <Link href="/careers" className="mobile-nav-item">
          <span>Careers</span>
        </Link>
        {user && role === "buyer" && (
          <Link href="/my-applications" className="mobile-nav-item">
            <span>My Apps</span>
          </Link>
        )}
        {user && role === "admin" && (
          <Link href="/admin-dashboard" className="mobile-nav-item">
            <span>Admin</span>
          </Link>
        )}
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
