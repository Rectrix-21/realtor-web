"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import "./styles.css";
import { supabase } from "../../database/supabase"; // adjust if your path differs
import { getProperties } from "../../lib/modify-property";
import { useAuth } from "../../database/auth";
import { isBookmarked, toggleBookmark } from "../../lib/bookmarks";

// Helper functions to convert database codes to readable text
function mapBasement(code) {
  if (code === "c") return "Concrete";
  if (code === "w") return "Wood";
  if (code === "f") return "Finished";
  if (code === "p") return "Partial";
  return String(code ?? "—");
}

function mapPropertyKind(code) {
  if (code === "H") return "House";
  if (code === "C") return "Condo";
  if (code === "T") return "Townhouse";
  if (code === "A") return "Apartment";
  if (code === "L") return "Land/Lot";
  if (code === "D") return "Duplex";
  if (code === "V") return "Villa";
  if (code === "M") return "Mobile/Manufactured";
  return String(code ?? "—");
}

export default function Listings() {
  const { user, loading: authLoading } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Bookmark state
  const [bookmarkedProperties, setBookmarkedProperties] = useState(new Set());
  const [bookmarkLoading, setBookmarkLoading] = useState(new Set());

  // --- Pagination state (6 per page) ---
  const PAGE_SIZE = 6;
  const [page, setPage] = useState(1);

  // --- Sorting state ---
  const [sortBy, setSortBy] = useState("description");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortDropdownRef = useRef(null);

  // Track Availability of properties
  const [availableProperties, setAvailableProperties] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        console.log("Fetching properties...");
        const data = await getProperties();
        const rows = Array.isArray(data)
          ? data.filter((p) => p.buyer_id == null)
          : [];

        setProperties(rows);
      } catch (error) {
        setErr(error?.message || "Failed to fetch properties");
        setProperties([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target)
      ) {
        setShowSortDropdown(false);
      }
    };

    if (showSortDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showSortDropdown]);

  // Reset to page 1 whenever the dataset changes
  useEffect(() => {
    setPage(1);
  }, [properties]);

  // Check bookmarks when user and properties are loaded
  useEffect(() => {
    if (user && properties.length > 0) {
      checkBookmarks();
    }
  }, [user, properties]);

  async function checkBookmarks() {
    if (!user || properties.length === 0) return;

    const bookmarked = new Set();

    // Check bookmark status for all properties
    for (const property of properties) {
      try {
        const isBookmarkedStatus = await isBookmarked(
          user.id,
          property.property_id
        );
        if (isBookmarkedStatus) {
          bookmarked.add(property.property_id);
        }
      } catch (error) {
        console.error("Error checking bookmark:", error);
      }
    }

    setBookmarkedProperties(bookmarked);
  }

  async function handleBookmarkToggle(e, propertyId) {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();

    if (!user) {
      alert("Please sign in to bookmark properties");
      return;
    }

    // Add to loading set
    setBookmarkLoading((prev) => new Set([...prev, propertyId]));

    try {
      const result = await toggleBookmark(user.id, propertyId);
      if (result.success) {
        setBookmarkedProperties((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(propertyId)) {
            newSet.delete(propertyId);
          } else {
            newSet.add(propertyId);
          }
          return newSet;
        });
      } else {
        console.error("Bookmark toggle failed:", result.error);
        alert("Failed to update bookmark. Please try again.");
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      alert("Failed to update bookmark. Please try again.");
    } finally {
      // Remove from loading set
      setBookmarkLoading((prev) => {
        const newSet = new Set(prev);
        newSet.delete(propertyId);
        return newSet;
      });
    }
  }

  // Sort properties based on current sort settings
  const sortedProperties = useMemo(() => {
    if (!properties || properties.length === 0) return [];

    const sorted = [...properties].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle different data types
      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase().trim();
        bValue = bValue.toLowerCase().trim();
      }

      // Convert to numbers for numeric fields
      if (sortBy === "price" || sortBy === "rooms" || sortBy === "sq_feet") {
        aValue = aValue != null ? Number(aValue) : 0;
        bValue = bValue != null ? Number(bValue) : 0;
      }

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortOrder === "asc" ? 1 : -1;
      if (bValue == null) return sortOrder === "asc" ? -1 : 1;

      // Handle NaN values for numeric fields
      if (isNaN(aValue) && isNaN(bValue)) return 0;
      if (isNaN(aValue)) return sortOrder === "asc" ? 1 : -1;
      if (isNaN(bValue)) return sortOrder === "asc" ? -1 : 1;

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [properties, sortBy, sortOrder]);

  // Derived pagination values
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil((sortedProperties?.length || 0) / PAGE_SIZE));
  }, [sortedProperties]);

  const pageSlice = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return (sortedProperties || []).slice(start, end);
  }, [sortedProperties, page]);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  function gotoPrev() {
    if (canPrev) setPage((p) => p - 1);
  }
  function gotoNext() {
    if (canNext) setPage((p) => p + 1);
  }

  const handleSortChange = (newSortBy) => {
    if (newSortBy === sortBy) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new sort field with ascending order
      setSortBy(newSortBy);
      setSortOrder("asc");
    }
    setShowSortDropdown(false);
    setPage(1); // Reset to first page when sorting
  };

  const sortOptions = [
    { value: "description", label: "Name" },
    { value: "rooms", label: "Rooms" },
    { value: "price", label: "Price" },
    { value: "sq_feet", label: "Square Feet" },
  ];

  const getCurrentSortLabel = () => {
    const option = sortOptions.find((opt) => opt.value === sortBy);
    const orderText = sortOrder === "asc" ? "↑" : "↓";
    return `${option?.label || "Sort"} ${orderText}`;
  };

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
          {user && (
            <li className="navbar-li">
              <Link href="/my-applications">My Applications</Link>
            </li>
          )}
        </ul>
      </nav>

      {/* View Switcher */}
      <div className="view-switcher">
        <button className="view-btn active">Gallery</button>
        <div className="sort-section" ref={sortDropdownRef}>
          <button
            className="sort-button"
            onClick={() => setShowSortDropdown(!showSortDropdown)}
          >
            <span>{getCurrentSortLabel()}</span>
            <span
              className={`sort-chevron ${showSortDropdown ? "rotated" : ""}`}
            >
              ▼
            </span>
          </button>

          {showSortDropdown && (
            <div className="sort-dropdown">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  className={`sort-option ${
                    sortBy === option.value ? "active" : ""
                  }`}
                  onClick={() => handleSortChange(option.value)}
                >
                  <span>{option.label}</span>
                  {sortBy === option.value && (
                    <span className="sort-order-indicator">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {console.log("current loading state:", loading)}

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

      {/* Property count and sort info */}
      {!loading && !err && sortedProperties.length > 0 && (
        <div className="listings-info">
          <span className="property-count">
            {sortedProperties.length} Properties Found
          </span>
          <span className="sort-info">Sorted by {getCurrentSortLabel()}</span>
        </div>
      )}

      {/* No properties message */}
      {!loading && !err && sortedProperties.length === 0 && (
        <div
          style={{
            padding: 16,
            textAlign: "center",
            fontSize: "1.2rem",
            fontWeight: "500",
          }}
        >
          No properties available.
        </div>
      )}

      {console.log("Properties:", properties)}

      {/* Listings Grid */}
      {!loading && !err && properties && (
        <div className="listings-grid">
          {pageSlice.map((p) => {
            const img =
              Array.isArray(p.image_urls) && p.image_urls[0]
                ? p.image_urls[0]
                : "/images/placeholder-house.jpg"; // add a placeholder in /public if you want

            const isPropertyBookmarked = bookmarkedProperties.has(
              p.property_id
            );
            const isLoadingBookmark = bookmarkLoading.has(p.property_id);

            return (
              <div key={p.property_id} className="listing-card-wrapper">
                <Link
                  href={`/view-listings/${p.property_id}`}
                  className="listing-link"
                >
                  <div className="listing-card">
                    <div className="listing-image-wrapper">
                      <Image
                        src={img}
                        alt={p.description || "Property"}
                        width={300}
                        height={200}
                        className="listing-image"
                      />
                      {user && (
                        <button
                          className={`listing-bookmark-btn ${
                            isPropertyBookmarked ? "bookmarked" : ""
                          }`}
                          onClick={(e) =>
                            handleBookmarkToggle(e, p.property_id)
                          }
                          disabled={isLoadingBookmark}
                          title={
                            isPropertyBookmarked
                              ? "Remove from bookmarks"
                              : "Add to bookmarks"
                          }
                        >
                          {isLoadingBookmark
                            ? "⏳"
                            : isPropertyBookmarked
                            ? "❤️"
                            : "🤍"}
                        </button>
                      )}
                    </div>
                    <div className="listing-info">
                      <div className="listing-address">
                        {p.description || "—"}
                      </div>
                      <div className="listing-price">
                        {p.price != null && !isNaN(p.price)
                          ? `$${Number(p.price).toLocaleString()}`
                          : "Price on request"}
                      </div>
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
                        <span>
                          {p.property_kind
                            ? mapPropertyKind(p.property_kind)
                            : "Type —"}
                        </span>
                      </div>
                      <div className="listing-details">
                        <span>
                          {p.basement_type
                            ? `Basement: ${mapBasement(p.basement_type)}`
                            : "Basement —"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
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
