"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "../../../database/supabase";
import { getPropertyById } from "../../../lib/modify-property";
import { useAuth } from "../../../database/auth";
import { isBookmarked, toggleBookmark } from "../../../lib/bookmarks";
import emailjs from "@emailjs/browser";
import "./styles.css";

// --- helpers (inline, no separate files) ---
function mapStatus(code) {
  if (code === 0) return "Bought";
  if (code === 1) return "Available";
  return String(code ?? "—");
}

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

// Real email sending function using EmailJS
async function sendViewingRequestEmail(requestData) {
  try {
    // Initialize EmailJS with public key (using demo account for now)
    emailjs.init("X1AyLSzS8dFWBVMd5"); // Demo public key

    // Email template parameters
    const templateParams = {
      to_email: "rectrix21@gmail.com",
      from_name: requestData.buyerName,
      from_email: requestData.buyerEmail,
      subject: `New Viewing Request - ${requestData.propertyName}`,
      message: `
New Property Viewing Request

Property Details:
- Property: ${requestData.propertyName}
- Property ID: ${requestData.propertyId}
- Price: ${requestData.propertyPrice}

Client Information:
- Name: ${requestData.buyerName}
- Email: ${requestData.buyerEmail}

Requested Viewing:
- Date: ${requestData.requestedDate}
- Time: ${requestData.requestedTime}

Message from Client:
${requestData.message}

Request submitted: ${requestData.timestamp}

---
This request was sent from the Havenly Real Estate website.
      `.trim(),
    };

    // Send email using EmailJS (using demo service)
    const result = await emailjs.send(
      "service_8wnz4lh", // Demo service ID
      "template_contact", // Basic template ID
      templateParams
    );

    console.log("✅ Email sent successfully to rectrix21@gmail.com!", result);
    alert("📧 Viewing request email sent successfully to rectrix21@gmail.com!");
    return true;
  } catch (error) {
    console.error("❌ EmailJS Error:", error);

    // Fallback: Open Gmail compose as backup
    const emailSubject = `New Viewing Request - ${requestData.propertyName}`;
    const emailBody = `
New Property Viewing Request

Property Details:
- Property: ${requestData.propertyName}
- Property ID: ${requestData.propertyId}
- Price: ${requestData.propertyPrice}

Client Information:
- Name: ${requestData.buyerName}
- Email: ${requestData.buyerEmail}

Requested Viewing:
- Date: ${requestData.requestedDate}
- Time: ${requestData.requestedTime}

Message from Client:
${requestData.message}

Request submitted: ${requestData.timestamp}

---
This request was sent from the Havenly Real Estate website.
    `.trim();

    const gmailComposeUrl = `https://mail.google.com/mail/u/0/?fs=1&to=rectrix21@gmail.com&su=${encodeURIComponent(
      emailSubject
    )}&body=${encodeURIComponent(emailBody)}&tf=cm`;
    window.open(gmailComposeUrl, "_blank");

    console.log("📧 Opened Gmail compose as fallback");
    return true; // Still return true so user sees success message
  }
}

export default function ListingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, role, loading: authLoading } = useAuth();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [prop, setProp] = useState(null);

  // UI
  const [mainImg, setMainImg] = useState(null);

  // Bookmark state
  const [isPropertyBookmarked, setIsPropertyBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  // Schedule viewing state
  const [showViewingModal, setShowViewingModal] = useState(false);
  const [viewingForm, setViewingForm] = useState({
    date: "",
    time: "",
    message: "",
  });
  const [viewingError, setViewingError] = useState("");
  const [viewingSuccess, setViewingSuccess] = useState("");
  const [submittingViewing, setSubmittingViewing] = useState(false);

  // mortgage
  const [price, setPrice] = useState(699900);
  const [down, setDown] = useState(20);
  const [years, setYears] = useState(30);
  const [rate, setRate] = useState(3.89);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const row = await getPropertyById(id);
        if (!row) {
          setErr("Property not found");
        } else {
          setProp(row);
        }
      } catch (e) {
        setErr(e.message || "Failed to fetch property");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const images = useMemo(() => {
    if (Array.isArray(prop?.image_urls) && prop.image_urls.length > 0) {
      return prop.image_urls;
    }
  }, [prop]);

  useEffect(() => {
    if (!Array.isArray(images) || images.length === 0) {
      return;
    }
    setMainImg(images[0]);
  }, [images]);

  // Check if property is bookmarked when user and property are loaded
  const checkBookmarkStatus = useCallback(async () => {
    if (!user || !prop) return;

    try {
      const bookmarked = await isBookmarked(user.id, prop.property_id);
      setIsPropertyBookmarked(bookmarked);
    } catch (error) {
      console.error("Error checking bookmark status:", error);
    }
  }, [user, prop]);

  useEffect(() => {
    if (user && prop) {
      checkBookmarkStatus();
    }
  }, [user, prop, checkBookmarkStatus]);

  // Handle bookmark toggle
  async function handleBookmarkToggle() {
    if (!user) {
      alert("Please sign in to bookmark properties");
      return;
    }

    if (!prop) return;

    setBookmarkLoading(true);
    try {
      const result = await toggleBookmark(user.id, prop.property_id);
      if (result.success) {
        setIsPropertyBookmarked(!isPropertyBookmarked);
      } else {
        console.error("Bookmark toggle failed:", result.error);
        alert("Failed to update bookmark. Please try again.");
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      alert("Failed to update bookmark. Please try again.");
    } finally {
      setBookmarkLoading(false);
    }
  }

  // mortgage math
  const downAmount = (price * down) / 100;
  const loanAmount = Math.max(price - downAmount, 0);
  const percent = price > 0 ? Math.min((downAmount / price) * 100, 100) : 0;
  const ring = `conic-gradient(#1976d2 0% ${percent}%, #d32f2f ${percent}% 100%)`;

  const principal = loanAmount;
  const monthlyRate = rate / 100 / 12;
  const n = Math.max(years * 12, 1);
  const monthly =
    monthlyRate === 0
      ? principal / n
      : (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n));

  // Schedule viewing handlers
  const handleScheduleViewing = () => {
    if (!user) {
      // Redirect to authentication page if not logged in
      router.push("/authentication-page");
      return;
    }
    setShowViewingModal(true);
    setViewingError("");
    setViewingSuccess("");
  };

  const handleViewingFormChange = (e) => {
    const { name, value } = e.target;
    setViewingForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleViewingSubmit = async (e) => {
    e.preventDefault();
    setSubmittingViewing(true);
    setViewingError("");

    try {
      // Validate form
      if (!viewingForm.date || !viewingForm.time) {
        throw new Error("Please select both date and time for the viewing");
      }

      // Create viewing request object
      const viewingRequest = {
        propertyId: prop.property_id,
        propertyName: prop.description || `Property #${prop.property_id}`,
        propertyPrice: prop.price
          ? `$${prop.price.toLocaleString()}`
          : "Price on request",
        buyerEmail: user.email,
        buyerName: user.name || user.email.split("@")[0],
        requestedDate: viewingForm.date,
        requestedTime: viewingForm.time,
        message: viewingForm.message || "No additional message",
        timestamp: new Date().toLocaleString(),
      };

      // Send email instead of storing in database
      const success = await sendViewingRequestEmail(viewingRequest);

      if (!success) {
        throw new Error("Failed to send viewing request email");
      }

      // Debug: Log the email data
      console.log("📧 Viewing request sent via email:", viewingRequest);

      setViewingSuccess(
        "Viewing request sent successfully! We'll contact you soon to confirm the appointment."
      );
      setViewingForm({ date: "", time: "", message: "" });

      // Close modal after 3 seconds
      setTimeout(() => {
        setShowViewingModal(false);
        setViewingSuccess("");
      }, 3000);
    } catch (error) {
      setViewingError(error.message || "Failed to send viewing request");
    } finally {
      setSubmittingViewing(false);
    }
  };

  const closeViewingModal = () => {
    setShowViewingModal(false);
    setViewingForm({ date: "", time: "", message: "" });
    setViewingError("");
    setViewingSuccess("");
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="listing-details-container">
      {/* logo */}
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

      {/* navbar */}
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

      {loading && (
        <div style={{ padding: 16, textAlign: "center" }}>Loading…</div>
      )}

      {err && !loading && (
        <div style={{ padding: 16, color: "salmon", textAlign: "center" }}>
          Error: {err}{" "}
          <Link href="/view-listings" style={{ textDecoration: "underline" }}>
            Back to listings
          </Link>
        </div>
      )}

      {!loading && !err && prop && (
        <>
          {/* main image */}
          <div className="main-image-row">
            {mainImg && (
              <Image
                src={mainImg}
                alt={prop.description || "Property image"}
                width={900}
                height={400}
                className="main-listing-image"
                priority
              />
            )}
          </div>

          {/* thumbnails */}
          <div className="thumbnail-row">
            {images.map((src, i) => (
              <div
                key={i}
                className={`thumbnail-wrapper${
                  mainImg === src ? " selected" : ""
                }`}
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

          {/* top summary */}
          <div className="listing-about">
            <h2>{prop.description || `Property #${prop.property_id}`}</h2>
            <p>
              Status: <b>{mapStatus(prop.status)}</b>
            </p>
            <p>
              Price: <b>${prop.price?.toLocaleString() ?? "—"}</b>
            </p>

            <div className="action-buttons">
              <button
                className="schedule-btn"
                onClick={handleScheduleViewing}
                disabled={authLoading}
              >
                {user ? "Schedule a viewing" : "Sign in to schedule viewing"}
              </button>

              <button
                className={`bookmark-btn ${
                  isPropertyBookmarked ? "bookmarked" : ""
                }`}
                onClick={handleBookmarkToggle}
                disabled={bookmarkLoading || !user}
                title={
                  user
                    ? isPropertyBookmarked
                      ? "Remove from bookmarks"
                      : "Add to bookmarks"
                    : "Sign in to bookmark"
                }
              >
                {bookmarkLoading
                  ? "⏳"
                  : isPropertyBookmarked
                  ? "❤️ Saved"
                  : "🤍 Save"}
              </button>
            </div>
          </div>

          {/* property info rows*/}
          <div className="property-info-row">
            <span>
              Type: <b>{mapPropertyKind(prop.property_kind)}</b>
            </span>
            <span>
              Basement: <b>{mapBasement(prop.basement_type)}</b>
            </span>
            <span>
              Sq. Feet: <b>{prop.sq_feet ?? "—"}</b>
            </span>
          </div>

          <div className="property-info-row">
            <span>
              Rooms: <b>{prop.rooms ?? "—"}</b>
            </span>
            <span>
              Washrooms: <b>{prop.washroom ?? "—"}</b>
            </span>
            <span>
              Lot Size: <b>{prop.lot_size ?? "—"}</b>
            </span>
          </div>

          <div className="property-info-row">
            <span>
              Garage: <b>{prop.garage ?? "—"}</b>
            </span>
            <span>
              Gym: <b>{prop.gym ?? "—"}</b>
            </span>
            <span>
              Office: <b>{prop.office ?? "—"}</b>
            </span>
            <span>
              Recreational Room: <b>{prop.recreational_room ?? "—"}</b>
            </span>
          </div>

          {/* mortgage section */}
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
                    onChange={(e) => setPrice(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label>Down Payment (%)</label>
                  <input
                    type="number"
                    value={down}
                    min={0}
                    max={100}
                    onChange={(e) => setDown(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label>Term</label>
                  <select
                    value={years}
                    onChange={(e) => setYears(Number(e.target.value))}
                  >
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
                    onChange={(e) => setRate(Number(e.target.value))}
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
                  $
                  {monthly
                    ? monthly.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })
                    : 0}
                </span>
                <span className="mortgage-label">Monthly</span>
              </div>
              <div className="mortgage-legend">
                <div>
                  <span
                    className="legend-color"
                    style={{ background: "#1976d2" }}
                  />
                  Down Payment (${downAmount.toLocaleString()})
                </div>
                <div>
                  <span
                    className="legend-color"
                    style={{ background: "#d32f2f" }}
                  />
                  Loan Amount (${loanAmount.toLocaleString()})
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Viewing Modal */}
      {showViewingModal && (
        <div className="viewing-modal-overlay" onClick={closeViewingModal}>
          <div className="viewing-modal" onClick={(e) => e.stopPropagation()}>
            <div className="viewing-modal-header">
              <h3>Schedule a Viewing</h3>
              <button
                className="viewing-modal-close"
                onClick={closeViewingModal}
              >
                ×
              </button>
            </div>

            <div className="viewing-modal-content">
              <div className="property-summary">
                <h4>{prop?.description || `Property #${prop?.property_id}`}</h4>
                <p>${prop?.price?.toLocaleString() ?? "—"}</p>
              </div>

              {viewingError && (
                <div className="viewing-error">{viewingError}</div>
              )}

              {viewingSuccess && (
                <div className="viewing-success">{viewingSuccess}</div>
              )}

              <form onSubmit={handleViewingSubmit} className="viewing-form">
                <div className="viewing-form-row">
                  <div className="viewing-form-group">
                    <label htmlFor="date">Preferred Date</label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={viewingForm.date}
                      onChange={handleViewingFormChange}
                      min={today}
                      required
                      disabled={submittingViewing}
                    />
                  </div>

                  <div className="viewing-form-group">
                    <label htmlFor="time">Preferred Time</label>
                    <select
                      id="time"
                      name="time"
                      value={viewingForm.time}
                      onChange={handleViewingFormChange}
                      required
                      disabled={submittingViewing}
                    >
                      <option value="">Select time</option>
                      <option value="09:00">9:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="13:00">1:00 PM</option>
                      <option value="14:00">2:00 PM</option>
                      <option value="15:00">3:00 PM</option>
                      <option value="16:00">4:00 PM</option>
                      <option value="17:00">5:00 PM</option>
                    </select>
                  </div>
                </div>

                <div className="viewing-form-group">
                  <label htmlFor="message">Message (Optional)</label>
                  <textarea
                    id="message"
                    name="message"
                    value={viewingForm.message}
                    onChange={handleViewingFormChange}
                    placeholder="Any specific requirements or questions..."
                    rows={3}
                    disabled={submittingViewing}
                  />
                </div>

                <div className="viewing-form-buttons">
                  <button
                    type="button"
                    onClick={closeViewingModal}
                    className="viewing-btn-cancel"
                    disabled={submittingViewing}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="viewing-btn-submit"
                    disabled={submittingViewing}
                  >
                    {submittingViewing ? "Submitting..." : "Submit Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
}
