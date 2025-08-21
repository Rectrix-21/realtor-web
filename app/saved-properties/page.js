"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../../database/auth";
import { getUserBookmarks, removeBookmark } from "../../lib/bookmarks";
import ProfileBanner from "../../components/ProfileBanner";
import "../styles.css"; // Import global styles for navbar
import "./styles.css";

export default function SavedProperties() {
  const { user, loading: authLoading, role } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBookmarks = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      const result = await getUserBookmarks(user.id);
      if (result.success) {
        setBookmarks(result.bookmarks);
      } else {
        setError("Failed to load saved properties");
      }
    } catch (err) {
      setError("Failed to load saved properties");
      console.error("Error loading bookmarks:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && user) {
      loadBookmarks();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading, loadBookmarks]);

  async function handleRemoveBookmark(propertyId) {
    if (!user) return;

    try {
      const result = await removeBookmark(user.id, propertyId);
      if (result.success) {
        setBookmarks(
          bookmarks.filter((bookmark) => bookmark.property_id !== propertyId)
        );
      } else {
        alert("Failed to remove bookmark");
      }
    } catch (err) {
      alert("Failed to remove bookmark");
      console.error("Error removing bookmark:", err);
    }
  }

  function mapStatus(status) {
    if (status === 1) return "Active";
    if (status === 0) return "Inactive";
    return "Unknown";
  }

  function mapPropertyKind(code) {
    if (code === "c") return "Condominium";
    if (code === "b") return "Bungalow";
    if (code === "t") return "Townhouse";
    if (code === "d") return "Detached";
    return String(code ?? "—");
  }

  if (authLoading || loading) {
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
            {user && (
              <li className="navbar-li">
                <Link href="/saved-properties">❤️ Saved</Link>
              </li>
            )}
            <li className="navbar-li">
              <Link href="/careers">Career opportunity</Link>
            </li>
            {role === "admin" && (
              <li className="navbar-li">
                <Link href="/admin-dashboard">Admin Dashboard</Link>
              </li>
            )}
          </ul>
        </nav>

        {user && (
          <div className="profile-banner-container">
            <ProfileBanner />
          </div>
        )}

        <div className="loading-message">Loading saved properties...</div>
      </div>
    );
  }

  if (!user) {
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

        <div className="auth-required">
          <h2>Sign In Required</h2>
          <p>Please sign in to view your saved properties.</p>
          <Link href="/authentication-page" className="auth-link">
            Sign In
          </Link>
        </div>
      </div>
    );
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
          {user && (
            <li className="navbar-li">
              <Link href="/saved-properties">Saved</Link>
            </li>
          )}
          <li className="navbar-li">
            <Link href="/careers">Career opportunity</Link>
          </li>
          {role === "admin" && (
            <li className="navbar-li">
              <Link href="/admin-dashboard">Admin Dashboard</Link>
            </li>
          )}
        </ul>
      </nav>

      {user && (
        <div className="profile-banner-container">
          <ProfileBanner />
        </div>
      )}
      {error && (
        <div className="error-message">
          {error}
          <button onClick={loadBookmarks} className="retry-btn">
            Try Again
          </button>
        </div>
      )}

      {bookmarks.length === 0 && !error && (
        <div className="no-bookmarks">
          <h3>No saved properties yet</h3>
          <p>Start browsing properties and save your favorites!</p>
          <Link href="/view-listings" className="browse-link">
            Browse Properties
          </Link>
        </div>
      )}

      {bookmarks.length > 0 && (
        <div className="listings-grid">
          {bookmarks.map((bookmark) => {
            const property = bookmark.Property;
            if (!property) return null;

            const imageUrl =
              Array.isArray(property.image_urls) &&
              property.image_urls.length > 0
                ? property.image_urls[0]
                : "/images/house1.jpg";

            return (
              <div key={bookmark.bookmark_id} className="listing-card-wrapper">
                <Link
                  href={`/view-listings/${property.property_id}`}
                  className="listing-card-link"
                >
                  <div className="listing-card">
                    <div className="card-image-wrapper">
                      <Image
                        src={imageUrl}
                        alt={property.description || "Property"}
                        width={300}
                        height={200}
                        className="card-image"
                      />
                      <div className="bookmark-overlay">
                        <button
                          className="remove-bookmark-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveBookmark(property.property_id);
                          }}
                          title="Remove from saved"
                        >
                          ❌
                        </button>
                      </div>
                    </div>

                    <div className="card-content">
                      <h3 className="card-title">
                        {property.description ||
                          `Property #${property.property_id}`}
                      </h3>

                      <div className="card-details">
                        <div className="detail-row">
                          <span>
                            Price:{" "}
                            <strong>
                              ${property.price?.toLocaleString() || "—"}
                            </strong>
                          </span>
                        </div>
                        <div className="detail-row">
                          <span>
                            Type: {mapPropertyKind(property.property_kind)}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span>Rooms: {property.rooms || "—"}</span>
                          <span>Washrooms: {property.washroom || "—"}</span>
                        </div>
                        <div className="detail-row">
                          <span>Sq. Feet: {property.sq_feet || "—"}</span>
                        </div>
                        <div className="detail-row">
                          <span>
                            Status:{" "}
                            <span className="status-badge">
                              {mapStatus(property.status)}
                            </span>
                          </span>
                        </div>
                      </div>

                      <div className="card-actions">
                        <span className="view-details-btn">View Details</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
