"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";
import "./styles.css";

export default function ListingDetails() {
  // Demo images for house1
  const images = [
    "/images/house1.jpg",
    "/images/house1/house1_1.jpg",
    "/images/house1/house1_2.jpg",
    "/images/house1/house1_3.jpg",
    "/images/house1/house1_4.jpg",
    "/images/house1/house1_5.jpg",
  ];

  const [mainImg, setMainImg] = useState(images[0]);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [propertiesOpen, setPropertiesOpen] = useState(false);
  const adminLoggedIn = false;

  // Mortgage calculator state
  const [price, setPrice] = useState(699900);
  const [down, setDown] = useState(20); // percent
  const [years, setYears] = useState(30);
  const [rate, setRate] = useState(3.89);

  // Down payment and loan calculation
  const downAmount = (price * down) / 100;
  const loanAmount = price - downAmount;
  const percent = Math.min((downAmount / price) * 100, 100);
  const ring = `conic-gradient(#1976d2 0% ${percent}%, #d32f2f ${percent}% 100%)`;

  // Calculate monthly payment
  const principal = loanAmount;
  const monthlyRate = rate / 100 / 12;
  const n = years * 12;
  const monthly =
    monthlyRate === 0
      ? principal / n
      : (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n));

  return (
    <div className="listing-details-container">
      {/* Logo */}
      <div className="logo">
        <span className="home-icon">&#127969;</span>
        <div className="logo-text">
          <span className="logo-main">Havenly</span>
        </div>
      </div>

      {/* Navbar */}
      <nav className="navbar">
        <ul className="navbar-ul">
          <li className="navbar-li"><Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link></li>
          {/* About Dropdown */}
          <li className="navbar-li" onClick={() => setAboutOpen(!aboutOpen)}>
            <div className="dropdown-header">
              About
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
          <li className="navbar-li">Career opportunity</li>
          {adminLoggedIn && (
            <li className="navbar-li">
              <Link href="/admin-dashboard">Admin Dashboard</Link>
            </li>
          )}
        </ul>
      </nav>

      {/* Main Image */}
      <div className="main-image-row">
        <Image
          src={mainImg}
          alt="Main"
          width={900}
          height={400}
          className="main-listing-image"
          priority
        />
      </div>

      {/* Thumbnails */}
      <div className="thumbnail-row">
        {images.map((src, i) => (
          <div
            key={i}
            className={`thumbnail-wrapper${mainImg === src ? " selected" : ""}`}
            onClick={() => setMainImg(src)}
          >
            <Image
              src={src}
              alt={`Thumbnail ${i + 1}`}
              width={120}
              height={80}
              className="thumbnail-image"
            />
          </div>
        ))}
      </div>

      {/* About Section */}
      <div className="listing-about">
        <h2>About 7944 Huntwick Crescent NE - A2197296 - $699,900</h2>
        <p>
          This Calgary home is located at 7944 Huntwick Crescent NE in the
          community of Huntington Hills.
        </p>
          <p>
          This home is 1050 sq ft and it has 5
          bedrooms and 2 baths.
        </p>
        <p>
          For more information about this Huntington Hills home please reach out
          and call Brick Developments at <b>+403-714-0954</b>
        </p>
        <button className="schedule-btn">Schedule a viewing</button>
      </div>

      {/* Property Info Rows */}
      <div className="property-info-row">
        <span className="status-active">Active</span>
        <span>
          Property Type: <b>Detached</b>
        </span>
        <span>
          MLS #: <b>A2197296</b>
        </span>
      </div>
      <div className="property-info-row">
        <span>
          Sq. Feet: <b>1,050</b>
        </span>
        <span>
          On Site: <b>12 Days</b>
        </span>
        <span>
          Lot Size: <b>0.15 Acres</b>
        </span>
      </div>

      {/* Mortgage Calculator & Chart */}
      <div className="mortgage-section">
        <div className="mortgage-calc">
          <h3>Mortgage Calculator</h3>
          <div className="mortgage-fields">
            <div>
              <label>Price</label>
              <input
                type="number"
                value={price}
                min={0}
                onChange={e => setPrice(Number(e.target.value))}
              />
            </div>
            <div>
              <label>Down Payment (%)</label>
              <input
                type="number"
                value={down}
                min={0}
                max={100}
                onChange={e => setDown(Number(e.target.value))}
              />
            </div>
            <div>
              <label>Term</label>
              <select value={years} onChange={e => setYears(Number(e.target.value))}>
                <option value={30}>30 Years</option>
                <option value={25}>25 Years</option>
                <option value={20}>20 Years</option>
                <option value={15}>15 Years</option>
                <option value={10}>10 Years</option>
              </select>
            </div>
            <div>
              <label>Rate (%)</label>
              <input
                type="number"
                value={rate}
                min={0}
                step={0.01}
                onChange={e => setRate(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
        <div className="mortgage-chart">
          <div
            className="mortgage-circle"
            style={{ background: ring }}
            title={`Down: $${downAmount.toLocaleString()} | Loan: $${loanAmount.toLocaleString()}`}
          >
            <span className="mortgage-amount">
              ${monthly ? monthly.toLocaleString(undefined, {maximumFractionDigits: 0}) : 0}
            </span>
            <span className="mortgage-label">Monthly</span>
          </div>
          <div className="mortgage-legend">
            <div>
              <span className="legend-color" style={{background:'#1976d2'}}></span>
              Down Payment (${downAmount.toLocaleString()})
            </div>
            <div>
              <span className="legend-color" style={{background:'#d32f2f'}}></span>
              Loan Amount (${loanAmount.toLocaleString()})
            </div>
          </div>
        </div>
      </div>

      {/* Schools & Parks */}
      <div className="schools-section">
  <h3>Schools & Parks</h3>
  <div className="schools-row">
    <div className="school-card">
      <div className="school-icon">🏫</div>
      <div className="school-desc">
        8 public & 8 Catholic schools serve this home. Of these, 1 has catchments. There are 2 private schools nearby.
      </div>
    </div>
    <div className="school-card">
      <div className="school-icon">🌲</div>
      <div className="school-desc">
        3 playgrounds, 2 ball diamonds and 1 other facilities are within a 20 min walk of this home.
      </div>
    </div>
    <div className="school-card">
      <div className="school-icon">🚌</div>
      <div className="school-desc">
        Street transit stop less than a 3 min walk away.
      </div>
    </div>
  </div>
</div>

<div className="walk-section">
  <h3>Walking And Transportation</h3>
  <div className="walk-row">
    <div className="walk-card">
      <div className="walk-icon">🚶‍♂️</div>
      <div className="walk-score">51</div>
      <div className="walk-label">Somewhat Walkable</div>
    </div>
    <div className="walk-card">
      <div className="walk-icon">🚌</div>
      <div className="walk-score">58</div>
      <div className="walk-label">Good Transit</div>
    </div>
    <div className="walk-card">
      <div className="walk-icon">🚴‍♂️</div>
      <div className="walk-score">64</div>
      <div className="walk-label">Bikeable</div>
    </div>
  </div>
</div>
    </div>
  );
}
