"use client";

/* run npm install @heroicons/react */

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import "./styles.css";
import { useAuth } from "../database/auth";

export default function Home() {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [propertiesOpen, setPropertiesOpen] = useState(false);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);

  const { role, signOut, user, loading } = useAuth();

  useEffect(() => {
    // Check if the user is an admin
    if (role === "admin") {
      setAdminLoggedIn(true);
    } else {
      setAdminLoggedIn(false);
    }
  }, [role]);

  if (user && loading) {
    return <div>Loading...</div>;
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
      <div className="logo">
        <span className="home-icon">&#127969;</span> HAVENLY
      </div>

      {user ? (
        <div className="signup-btn">
          <button
            className="custom-button-home"
            onClick={async (e) => {
              e.preventDefault();
              console.log("SignOut button clicked");
              console.log("typeof signOut:", typeof signOut);
              const res = await signOut();
              console.log("after signOut()", res);
            }}
          >
            Sign Out
          </button>
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
          <li className="navbar-li">
            <Link href="/careers">Career opportunity</Link>
          </li>
          <li>
            {adminLoggedIn ? (
              <div className="navbar-li">
                <Link href="/admin-dashboard">Admin Dashboard</Link>
              </div>
            ) : null}
          </li>
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
