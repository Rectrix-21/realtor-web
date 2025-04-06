"use client";

/* run npm install @heroicons/react */

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import "./styles.css";

export default function Home() {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [propertiesOpen, setPropertiesOpen] = useState(false);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);

  const handleDropdownItemClick = (e, item) => {
    e.stopPropagation();
    console.log(`${item} clicked`);
  };

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
        <span className="home-icon">&#127969;</span> BRICK DEVELOPMENTS
      </div>

      {/* Sign Up Button */}
      <div className="signup-btn">
        <Link href="/authentication-page">
          <button className="custom-button-home">Sign Up</button>
        </Link>
      </div>

      {/* Navbar */}
      <nav className="navbar">
        <ul className="navbar-ul">
          <li className="navbar-li">Home</li>

          {/* About Dropdown */}
          <li className="navbar-li" onClick={() => setAboutOpen(!aboutOpen)}>
            <div className="dropdown-header">
              About{" "}
              {aboutOpen ? (
                <ChevronUpIcon className="chevron" width={20} height={20} />
              ) : (
                <ChevronDownIcon className="chevron" width={20} height={20} />
              )}
            </div>
            {aboutOpen && (
              <div className="dropdown-content">
                <p
                  className="dropdown-item"
                  onClick={(e) => handleDropdownItemClick(e, "Contact")}
                >
                  Contact
                </p>
                <p
                  className="dropdown-item"
                  onClick={(e) => handleDropdownItemClick(e, "Testimonials")}
                >
                  Testimonials
                </p>
                <p
                  className="dropdown-item"
                  onClick={(e) => handleDropdownItemClick(e, "Community")}
                >
                  Community
                </p>
              </div>
            )}
          </li>

          {/* Properties Dropdown */}
          <li
            className="navbar-li"
            onClick={() => setPropertiesOpen(!propertiesOpen)}
          >
            <div className="dropdown-header">
              Properties{" "}
              {propertiesOpen ? (
                <ChevronUpIcon className="chevron" width={20} height={20} />
              ) : (
                <ChevronDownIcon className="chevron" width={20} height={20} />
              )}
            </div>
            {propertiesOpen && (
              <div className="dropdown-content">
                <p
                  className="dropdown-item"
                  onClick={(e) =>
                    handleDropdownItemClick(e, "Upcoming Projects")
                  }
                >
                  Upcoming Projects
                </p>
              </div>
            )}
          </li>

          <li className="navbar-li">Career Opportunity</li>
          {adminLoggedIn && (
            <li className="navbar-li">
              <Link href="/admin-dashboard">Admin Dashboard</Link>
            </li>
          )}
        </ul>
      </nav>

      {/* Main Content */}
      <div className="main-content">
        <h1>
          <span className="bold-text">Brick</span>{" "}
          <span className="light-text">Developments</span>
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
          <button className="custom-button-home view-button">
            View Listings
          </button>
        </div>
      </div>
    </div>
  );
}
