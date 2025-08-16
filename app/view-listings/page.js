"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import "./styles.css";
import { supabase } from "../../database/supabase"; // adjust if your path differs

export default function Listings() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      const { data, error } = await supabase
        .from("Property")
        .select(
          "property_id, description, rooms, sq_feet, washroom, image_urls"
        )
        .order("property_id", { ascending: true });

      if (error) setErr(error.message);
      else setProperties(data || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="listings-container">
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

      {loading && (
        <div
          style={{
            padding: 16,
            textAlign: "center",
            fontSize: "1.5rem",
            fontWeight: "500",
          }}
        >
          Loading listings…
        </div>
      )}
      {err && <div style={{ padding: 16, color: "salmon" }}>Error: {err}</div>}

      {/* Listings Grid */}
      {!loading && !err && (
        <div className="listings-grid">
          {properties.map((p) => {
            const img =
              Array.isArray(p.image_urls) && p.image_urls[0]
                ? p.image_urls[0]
                : "/images/placeholder-house.jpg"; // add a placeholder in /public if you want

            return (
              <Link
                href={`/view-listings/${p.property_id}`}
                key={p.property_id}
                className="listing-link"
              >
                <div className="listing-card">
                  <Image
                    src={img}
                    alt={p.description || "Property"}
                    width={300}
                    height={200}
                    className="listing-image"
                  />
                  <div className="listing-info">
                    <div className="listing-address">
                      {p.description || "—"}
                    </div>
                    {/* You don't have a price column in your schema; hide or replace */}
                    {/* <div className="listing-price">{p.price ?? "—"}</div> */}
                    <div className="listing-details">
                      <span>
                        {p.rooms != null ? `${p.rooms} Beds` : "Beds —"}
                      </span>
                      <span>
                        {p.sq_feet != null ? `${p.sq_feet} Sq.Ft.` : "Size —"}
                      </span>
                    </div>
                    <div className="listing-details">
                      <span>
                        {p.washroom != null ? `${p.washroom} Baths` : "Baths —"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination (static for now) */}
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
