"use client";

import Link from "next/link";
import Image from "next/image";
//import "./styles.css";

const listings = [
  {
    id: 1,
    address: "7944 Huntwick Crescent NE",
    price: "$699,900",
    beds: "5 Beds",
    size: "1,050 Sq.Ft.",
    baths: "2 Baths",
    image: "/images/house1.jpg",
    details: [],
  },
  {
    id: 2,
    address: "145 Point Dr NW #903",
    price: "$389,900",
    beds: "2 Beds",
    size: "965 Sq.Ft.",
    baths: "1F 1.5 Baths",
    image: "/images/house2.jpg",
    details: [],
  },
  {
    id: 3,
    address: "248 Kinniburgh Blvd #38",
    price: "$409,900",
    beds: "2 Beds",
    size: "1,383 Sq.Ft.",
    baths: "2 Baths",
    image: "/images/house3.jpg",
    details: [],
  },
];

export default function Listings() {
  return (
    <div className="listings-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          <span className="home-icon">&#127969;</span> BRICK DEVELOPMENTS
        </div>
        <ul className="navbar-ul">
          <li className="navbar-li">
            <Link href="/">Home</Link>
          </li>
          <li className="navbar-li">About</li>
          <li className="navbar-li">Properties</li>
          <li className="navbar-li">Career opportunity</li>
        </ul>
      </nav>

      {/* View Switcher */}
      <div className="view-switcher">
        <button className="view-btn active">Gallery</button>
        <button className="view-btn">List</button>
        <button className="view-btn">Map</button>
        <div className="sort-section">
          <span>Sort</span>
          <span className="sort-icon">☰</span>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="listings-grid">
        {listings.map((listing) => (
          <div className="listing-card" key={listing.id}>
            <Image
              src={listing.image}
              alt={listing.address}
              width={300}
              height={200}
              className="listing-image"
            />
            <div className="listing-info">
              <div className="listing-address">{listing.address}</div>
              <div className="listing-price">{listing.price}</div>
              <div className="listing-details">
                <span>{listing.beds}</span>
                <span>{listing.size}</span>
              </div>
              <div className="listing-details">
                <span>{listing.baths}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <span className="pagination-arrow">{"<"}</span>
        <span className="pagination-page active">1</span>
        <span className="pagination-page">2</span>
        <span className="pagination-page">3</span>
        <span className="pagination-arrow">{">"}</span>
      </div>
    </div>
  );
}
