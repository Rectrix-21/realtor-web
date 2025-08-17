"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "../../../database/supabase";
import { getPropertyById } from "../../../lib/modify-property";
import "./styles.css";

// --- helpers (inline, no separate files) ---
function mapStatus(code) {
  if (code === 0) return "Bought";
  if (code === 1) return "Available";
  return String(code ?? "—");
}

function mapBasement(code) {
  if (code === "c") return "Crawlspace";
  if (code === "w") return "Walkout";
  if (code === "f") return "Full";
  if (code === "p") return "Partial";
  return String(code ?? "—");
}

function mapPropertyKind(code) {
  if (code === "c") return "Condominium";
  if (code === "b") return "Bungalow";
  if (code === "t") return "Townhouse";
  if (code === "d") return "Detached";
  return String(code ?? "—");
}

export default function ListingDetailsPage() {
  const params = useParams();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [prop, setProp] = useState(null);

  // UI
  const [mainImg, setMainImg] = useState(null);

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

  return (
    <div className="listing-details-container">
      {/* logo */}
      <div className="logo">
        <span className="home-icon">&#127969;</span>
        <div className="logo-text">
          <span className="logo-main">Havenly</span>
        </div>
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
            <button className="schedule-btn">Schedule a viewing</button>
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
    </div>
  );
}
