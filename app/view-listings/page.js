"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import "./styles.css";
import { supabase } from "../../database/supabase"; // adjust if your path differs
import { getProperties } from "../../lib/modify-property";

export default function Listings() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // --- Pagination state (6 per page) ---
  const PAGE_SIZE = 6;
  const [page, setPage] = useState(1);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const data = await getProperties();
        setProperties(Array.isArray(data) ? data : []);
      } catch (error) {
        setErr(error?.message || "Failed to fetch properties");
        setProperties([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Reset to page 1 whenever the dataset changes
  useEffect(() => {
    setPage(1);
  }, [properties]);

  // Derived pagination values
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil((properties?.length || 0) / PAGE_SIZE));
  }, [properties]);

  const pageSlice = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return (properties || []).slice(start, end);
  }, [properties, page]);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  function gotoPrev() {
    if (canPrev) setPage((p) => p - 1);
  }
  function gotoNext() {
    if (canNext) setPage((p) => p + 1);
  }

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
          {pageSlice.map((p) => {
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
                        {p.rooms != null ? `${p.rooms} Rooms` : "Beds —"}
                      </span>
                      <span>
                        {p.sq_feet != null ? `${p.sq_feet} Sq.Ft.` : "Size —"}
                      </span>
                    </div>
                    <div className="listing-details">
                      <span>
                        {p.washroom != null
                          ? `${p.washroom} Washrooms`
                          : "Baths —"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && !err && properties?.length > 0 && (
        <div className="pagination">
          <span
            className="pagination-arrow"
            onClick={gotoPrev}
            style={{
              opacity: canPrev ? 1 : 0.4,
              pointerEvents: canPrev ? "auto" : "none",
            }}
          >
            {"<"}
          </span>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <span
              key={n}
              className={`pagination-page ${page === n ? "active" : ""}`}
              onClick={() => setPage(n)}
            >
              {n}
            </span>
          ))}

          <span
            className="pagination-arrow"
            onClick={gotoNext}
            style={{
              opacity: canNext ? 1 : 0.4,
              pointerEvents: canNext ? "auto" : "none",
            }}
          >
            {">"}
          </span>
        </div>
      )}
    </div>
  );
}
