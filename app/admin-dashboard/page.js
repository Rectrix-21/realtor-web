"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  HomeIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  UsersIcon,
  ClipboardDocumentListIcon,
  BuildingOffice2Icon,  
} from "@heroicons/react/24/outline";
import "./styles.css";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  getProperties,
  insertProperty,
  updateProperty,
  deleteProperty,
  uploadPropertyImage,
  deletePropertyImages,
} from "../../lib/modify-property.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const applicationsData = [
  {
    name: "John Smith",
    date: "June 10 2025",
    property: "Highland Gardens",
    email: "Johnsmith1@gmail.com",
    phone: "123-456-7890",
    status: "pending",
  },
  {
    name: "Darinda Clark",
    date: "May 3 2025",
    property: "Common Estates",
    email: "Clark0darinda@gmail.com",
    phone: "123-456-7890",
    status: "accepted",
  },
  {
    name: "Tyrese Morgan",
    date: "June 10 2025",
    property: "Virello Quarters",
    email: "Tymorgan1@gmail.com",
    phone: "123-456-7890",
    status: "rejected",
  },
];

const statusColors = {
  pending: "#003d74",
  accepted: "#0c7400",
  rejected: "#740000",
};

const clientsData = [
  {
    name: "Eli Johnson",
    status: "Active",
    agent: "Mike Lee",
    inquiries: 3,
    email: "EliJohnson@example.com",
    phone: "403-123-4567",
    leadStage: "Contacted",
    savedProperties: 2,
    inquiryHistory: 5,
    note: "",
  },
  {
    name: "Alison Smith",
    status: "Inactive",
    agent: "Mike Lee",
    inquiries: 2,
    email: "AlisonSmith@example.com",
    phone: "403-987-6543",
    leadStage: "Viewing Schedule",
    savedProperties: 1,
    inquiryHistory: 3,
    note: "",
  },
  {
    name: "Karen Ling",
    status: "Closed",
    agent: "Susan Bron",
    inquiries: 0,
    email: "KarenLing@example.com",
    phone: "403-555-1234",
    leadStage: "Closed",
    savedProperties: 0,
    inquiryHistory: 1,
    note: "",
  },
];

export default function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedClientIdx, setSelectedClientIdx] = useState(0);

  // ----- Property state -----
  const [properties, setProperties] = useState([]);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [editIdx, setEditIdx] = useState(null); // UI index
  const [editingId, setEditingId] = useState(null); // DB primary key (property_id)
  const [uploadedFiles, setUploadedFiles] = useState([]); // storage paths for cleanup

  // Match your Property table columns
  const [propertyForm, setPropertyForm] = useState({
    rooms: "",
    status: "",
    washroom: "",
    garage: "",
    gym: "",
    office: "",
    recreational_room: "",
    basement_type: "",
    property_kind: "",
    description: "",
    buyer_id: "",
    image_urls: [], // text[] of public URLs
    sq_feet: "",
    lot_size: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const rows = await getProperties();
        setProperties(rows);
      } catch (e) {
        console.error("Failed to load properties:", e.message);
      }
    })();
  }, []);

  const chartData = {
    labels: ["2019", "2020", "2021", "2022", "2023", "2024"],
    datasets: [
      {
        label: "Revenue",
        data: [420000, 480000, 500000, 600000, 650000, 699900],
        borderColor: "#ad8b18",
        backgroundColor: "rgba(212,175,55,0.2)",
        tension: 0.4,
        pointRadius: 3,
      },
      {
        label: "Expense",
        data: [300000, 320000, 350000, 400000, 410000, 432000],
        borderColor: "#b65138",
        backgroundColor: "rgba(255,111,97,0.2)",
        tension: 0.4,
        pointRadius: 3,
      },
    ],
  };
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: "#fff", font: { size: 14 } } },
      title: { display: false },
    },
    scales: {
      x: { ticks: { color: "#fff" }, grid: { color: "rgba(255,255,255,0.1)" } },
      y: { ticks: { color: "#fff" }, grid: { color: "rgba(255,255,255,0.1)" } },
    },
  };

  // applications filter
  const filteredApps = applicationsData.filter((app) => {
    if (filter !== "all" && app.status !== filter) return false;
    if (search && !app.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  // property handlers
  function handlePropertyFieldChange(e) {
    const { name, value } = e.target;
    setPropertyForm((prev) => ({ ...prev, [name]: value }));
  }

  // Upload images immediately, track files for cleanup, store public URLs
  async function handlePropertyImageChange(e) {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      try {
        const { publicUrl, filePath } = await uploadPropertyImage(file);
        setPropertyForm((prev) => ({
          ...prev,
          image_urls: [...prev.image_urls, publicUrl],
        }));
        setUploadedFiles((prev) => [...prev, filePath]);
      } catch (err) {
        console.error("Image upload failed:", err.message);
      }
    }
  }

  async function handlePropertySubmit(e) {
    e.preventDefault();
    const body = {
      ...propertyForm,
      // cast numeric fields
      rooms: propertyForm.rooms !== "" ? parseInt(propertyForm.rooms) : null,
      status: propertyForm.status !== "" ? parseInt(propertyForm.status) : null,
      washroom:
        propertyForm.washroom !== "" ? parseInt(propertyForm.washroom) : null,
      garage: propertyForm.garage !== "" ? parseInt(propertyForm.garage) : null,
      gym: propertyForm.gym !== "" ? parseInt(propertyForm.gym) : null,
      office: propertyForm.office !== "" ? parseInt(propertyForm.office) : null,
      recreational_room:
        propertyForm.recreational_room !== ""
          ? parseInt(propertyForm.recreational_room)
          : null,
      sq_feet:
        propertyForm.sq_feet !== "" ? parseInt(propertyForm.sq_feet) : null,
      lot_size:
        propertyForm.lot_size !== "" ? parseInt(propertyForm.lot_size) : null,
    };

    try {
      if (editingId) {
        await updateProperty(editingId, body);
      } else {
        await insertProperty(body);
      }
      const rows = await getProperties();
      setProperties(rows);
      setUploadedFiles([]);
    } catch (err) {
      console.error("Save failed:", err.message);
    }

    // reset
    resetPropertyForm();
    setShowPropertyForm(false);
  }

  async function handleCancelPropertyForm() {
    try {
      await deletePropertyImages(uploadedFiles); // clean up temp uploads if user cancels form midway
    } catch (err) {
      console.error("Cleanup failed:", err.message);
    }
    resetPropertyForm();
    setShowPropertyForm(false);
  }

  function resetPropertyForm() {
    setPropertyForm({
      rooms: "",
      status: "",
      washroom: "",
      garage: "",
      gym: "",
      office: "",
      recreational_room: "",
      basement_type: "",
      property_kind: "",
      description: "",
      buyer_id: "",
      image_urls: [],
      sq_feet: "",
      lot_size: "",
    });
    setEditIdx(null);
    setEditingId(null);
    setUploadedFiles([]);
  }

  function handleEdit(idx) {
    const row = properties[idx];
    setPropertyForm({
      rooms: row.rooms ?? "",
      status: row.status ?? "",
      washroom: row.washroom ?? "",
      garage: row.garage ?? "",
      gym: row.gym ?? "",
      office: row.office ?? "",
      recreational_room: row.recreational_room ?? "",
      basement_type: row.basement_type ?? "",
      property_kind: row.property_kind ?? "",
      description: row.description ?? "",
      buyer_id: row.buyer_id ?? "",
      image_urls: Array.isArray(row.image_urls) ? row.image_urls : [],
      sq_feet: row.sq_feet ?? "",
      lot_size: row.lot_size ?? "",
    });
    setEditIdx(idx);
    setEditingId(row.property_id);
    setShowPropertyForm(true);
    setUploadedFiles([]);
  }

  async function handleDelete(idx) {
    const row = properties[idx];
    if (!row?.property_id) return;
    try {
      await deleteProperty(row.property_id);
      const rows = await getProperties();
      setProperties(rows);
    } catch (e) {
      console.error("Delete failed:", e.message);
    }
  }

  // ----- UI -----
  return (
    <div className="admin-container">
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <button
          className="menu-btn"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Bars3Icon width={24} height={24} />
        </button>
        <ul className="sidebar-menu">
          <li
            className={`menu-item ${
              activeSection === "dashboard" ? "active" : ""
            }`}
            onClick={() => setActiveSection("dashboard")}
          >
            <HomeIcon width={20} height={20} />
            {isSidebarOpen && <span className="menu-item-text">Dashboard</span>}
          </li>
          <li
            className={`menu-item ${
              activeSection === "clients" ? "active" : ""
            }`}
            onClick={() => setActiveSection("clients")}
          >
            <UsersIcon width={20} height={20} />
            {isSidebarOpen && <span className="menu-item-text">Clients</span>}
          </li>
          <li
            className={`menu-item ${
              activeSection === "applications" ? "active" : ""
            }`}
            onClick={() => setActiveSection("applications")}
          >
            <ClipboardDocumentListIcon width={20} height={20} />
            {isSidebarOpen && (
              <span className="menu-item-text">Applications</span>
            )}
          </li>
          <li
            className={`menu-item ${
              activeSection === "property" ? "active" : ""
            }`}
            onClick={() => setActiveSection("property")}
          >
            <BuildingOffice2Icon width={20} height={20} />
            {isSidebarOpen && <span className="menu-item-text">Property</span>}
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="ad-main-content">
        {/* Top bar */}
        <div className="top-bar">
          <button className="ad-top-btn ad-logout-btn">
            <ArrowLeftOnRectangleIcon width={20} height={20} /> Logout
          </button>
          <Link href="/" passHref>
            <button className="ad-top-btn ad-home-btn">Home</button>
          </Link>
        </div>

        {/* Dashboard */}
        {activeSection === "dashboard" && (
          <>
            <h2 className="welcome-title">Welcome Back!</h2>
            <div className="dashboard-content">
              <div className="dashboard-cards">
                <div className="dashboard-card revenue-card">
                  <div className="card-title">$ Total Revenue</div>
                  <div className="card-value">$699,900</div>
                  <div className="card-footer">
                    <span className="card-change positive">+28%</span>
                    <span className="card-note">From last week</span>
                  </div>
                </div>
                <div className="dashboard-card cost-card">
                  <div className="card-title">$ Maintenance Cost</div>
                  <div className="card-value">$432,000</div>
                  <div className="card-footer">
                    <span className="card-change negative">+12%</span>
                    <span className="card-note">From last week</span>
                  </div>
                </div>
              </div>
              <div className="dashboard-graph">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          </>
        )}

        {/* Applications */}
        {activeSection === "applications" && (
          <div className="applications-dashboard-container">
            <div className="applications-header-row">
              <div className="applications-title-row">
                <ClipboardDocumentListIcon
                  width={38}
                  height={38}
                  color="#e5d7b2"
                />
                <h1 className="applications-title">Applications</h1>
              </div>
              <div className="applications-status-tabs">
                <button
                  className={`status-tab ${
                    filter === "pending" ? "active" : ""
                  }`}
                  style={{ background: statusColors.pending }}
                  onClick={() => setFilter("pending")}
                >
                  PENDING
                </button>
                <button
                  className={`status-tab ${
                    filter === "accepted" ? "active" : ""
                  }`}
                  style={{ background: statusColors.accepted }}
                  onClick={() => setFilter("accepted")}
                >
                  ACCEPTED
                </button>
                <button
                  className={`status-tab ${
                    filter === "rejected" ? "active" : ""
                  }`}
                  style={{ background: statusColors.rejected }}
                  onClick={() => setFilter("rejected")}
                >
                  REJECTED
                </button>
              </div>
              <button
                className={`status-tab ${filter === "all" ? "active" : ""}`}
                style={{ background: "#000", marginLeft: "24px" }}
                onClick={() => setFilter("all")}
              >
                ALL
              </button>
              <div className="search-applicant">
                <input
                  type="text"
                  placeholder="Search for Applicant"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="applications-list">
              {filteredApps.map((app, idx) => (
                <div className="application-card" key={idx}>
                  <div className="application-info">
                    <div className="application-name">{app.name}</div>
                    <div className="application-date">{app.date}</div>
                    <div className="application-property">{app.property}</div>
                    <div className="application-contact">
                      {app.email} &nbsp;|&nbsp; {app.phone}
                    </div>
                  </div>
                  <div className="application-actions">
                    <span
                      className="application-status"
                      style={{ background: statusColors[app.status] }}
                    >
                      {app.status.toUpperCase()}
                    </span>
                    <button className="application-more-btn">MORE INFO</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clients */}
        {activeSection === "clients" && (
          <div className="clients-dashboard-container">
            <div className="clients-header-row">
              <UsersIcon width={48} height={48} color="#e5d7b2" />
              <h1 className="clients-title">Clients</h1>
            </div>
            <div className="clients-main-row">
              <div className="clients-table-section">
                <div className="clients-table-header">
                  <div className="clients-table-header-cell">NAME</div>
                  <div className="clients-table-header-cell">STATUS</div>
                  <div className="clients-table-header-cell">
                    ASSIGNED AGENT
                  </div>
                  <div className="clients-table-header-cell">
                    INQUIRIES/ VIEWINGS
                  </div>
                </div>
                {clientsData.map((client, idx) => (
                  <div
                    className={`clients-table-row${
                      selectedClientIdx === idx ? " selected" : ""
                    }`}
                    key={idx}
                    onClick={() => setSelectedClientIdx(idx)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="clients-table-cell">{client.name}</div>
                    <div className="clients-table-cell">{client.status}</div>
                    <div className="clients-table-cell">{client.agent}</div>
                    <div className="clients-table-cell">{client.inquiries}</div>
                  </div>
                ))}
              </div>
              <div className="clients-profile-section">
                <div className="client-profile-card">
                  <div className="client-profile-title">Client Profile</div>
                  <div className="client-profile-avatar"></div>
                  <div className="client-profile-name">
                    {clientsData[selectedClientIdx].name}
                  </div>
                  <div className="client-profile-contact">
                    {clientsData[selectedClientIdx].email}
                    <br />
                    {clientsData[selectedClientIdx].phone}
                  </div>
                  <textarea
                    className="client-profile-note"
                    placeholder="Note"
                    value={clientsData[selectedClientIdx].note}
                    readOnly
                  />
                  <div className="client-profile-properties">
                    Saved Properties:{" "}
                    {clientsData[selectedClientIdx].savedProperties}
                  </div>
                </div>
                <div className="lead-stage-tracker">
                  <div className="lead-stage-title">Lead Stage Tracker</div>
                  <div className="lead-stage-list">
                    <div className="lead-stage-item">
                      <span className="lead-stage-dot new"></span> New
                    </div>
                    <div className="lead-stage-item">
                      <span className="lead-stage-dot contacted"></span>{" "}
                      Contacted
                    </div>
                    <div className="lead-stage-item">
                      <span className="lead-stage-dot viewing"></span> Viewing
                      Schedule
                    </div>
                    <div className="lead-stage-item">
                      <span className="lead-stage-dot offer"></span> Offer Made
                    </div>
                    <div className="lead-stage-item">
                      <span className="lead-stage-dot closed"></span> Closed
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Property */}
        {activeSection === "property" && (
          <div className="property-dashboard-container">
            <div className="property-header-row">
              <BuildingOffice2Icon width={48} height={48} color="#e5d7b2" />
              <h1 className="property-title">Manage Properties</h1>
              <button
                className="property-add-btn"
                onClick={() => {
                  setShowPropertyForm(true);
                  setEditIdx(null);
                  setEditingId(null);
                  setUploadedFiles([]);
                }}
              >
                + Add Property
              </button>
            </div>

            {showPropertyForm && (
              <form className="property-form" onSubmit={handlePropertySubmit}>
                {/* Image upload */}
                <label>
                  Images:
                  <input
                    type="file"
                    name="image_urls"
                    multiple
                    onChange={handlePropertyImageChange}
                  />
                </label>

                {/* Inputs for each column */}
                {[
                  "rooms",
                  "status",
                  "washroom",
                  "garage",
                  "gym",
                  "office",
                  "recreational_room",
                  "basement_type",
                  "property_kind",
                  "description",
                  "buyer_id",
                  "sq_feet",
                  "lot_size",
                ].map((field) => (
                  <label key={field}>
                    {field
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                    :
                    <input
                      name={field}
                      value={propertyForm[field]}
                      onChange={handlePropertyFieldChange}
                    />
                  </label>
                ))}

                {/* Live preview of uploaded images */}
                {propertyForm.image_urls.length > 0 && (
                  <div style={{ display: "flex", gap: 8, margin: "8px 0" }}>
                    {propertyForm.image_urls.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt="property"
                        style={{
                          width: 60,
                          height: 60,
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                    ))}
                  </div>
                )}

                <button type="submit">
                  {editIdx !== null ? "Update" : "Add"} Property
                </button>
                <button type="button" onClick={handleCancelPropertyForm}>
                  Cancel
                </button>
              </form>
            )}

            <div className="property-list">
              {properties.map((prop, idx) => (
                <div className="property-card" key={prop.property_id || idx}>
                  <div className="property-details">
                    {Object.entries(prop).map(
                      ([key, value]) =>
                        key !== "property_id" && (
                          <div key={key}>
                            <b>
                              {key
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (ch) => ch.toUpperCase())
                                .replace(/\bUrls\b/i, "URLs")}
                              :
                            </b>{" "}
                            {Array.isArray(value) && key === "image_urls" ? (
                              <span style={{ display: "inline-flex", gap: 6 }}>
                                {value.map((url, i) => (
                                  <img
                                    key={i}
                                    src={url}
                                    alt="property"
                                    style={{
                                      width: 60,
                                      height: 60,
                                      objectFit: "cover",
                                      borderRadius: 8,
                                    }}
                                  />
                                ))}
                              </span>
                            ) : Array.isArray(value) ? (
                              value.join(", ")
                            ) : (
                              String(value ?? "")
                            )}
                          </div>
                        )
                    )}
                  </div>
                  <div className="property-actions">
                    <button onClick={() => handleEdit(idx)}>Edit</button>
                    <button onClick={() => handleDelete(idx)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
