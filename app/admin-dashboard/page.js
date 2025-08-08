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
import { supabase } from "../../database/supabase";
import React from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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
  const [properties, setProperties] = useState([]);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [propertyForm, setPropertyForm] = useState({
    photos: [],
    about: "",
    type: "",
    mls: "",
    rooms: "",
    price: "",
    sqft: "",
    lotSize: "",
    location: "",
  });
  const [applicationsData, setApplicationsData] = useState([]);
  const [contractorSkills, setcontractorSkills] = useState([]);
  const [showSkillsModal, setShowSkillsModal] = useState(false);

  useEffect(() => {
    async function fetchContractors() {
      const { data, error } = await supabase.from("Contractor").select("*");
      if (error) {
        console.error("Error fetching contractors:", error);
      } else {
        setApplicationsData(data);
      }
    }

    fetchContractors();
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
      legend: {
        labels: {
          color: "#fff",
          font: { size: 14 },
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: { color: "#fff" },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
      y: {
        ticks: { color: "#fff" },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
    },
  };

  const filteredApps = applicationsData.filter((app) => {
    if (filter !== "all" && app.status !== filter) return false;
    if (search && !app.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  function handlePropertyChange(e) {
    const { name, value, files } = e.target;
    if (name === "photos") {
      setPropertyForm({ ...propertyForm, photos: files });
    } else {
      setPropertyForm({ ...propertyForm, [name]: value });
    }
  }

  function handlePropertySubmit(e) {
    e.preventDefault();
    if (editIdx !== null) {
      const updated = [...properties];
      updated[editIdx] = propertyForm;
      setProperties(updated);
      setEditIdx(null);
    } else {
      setProperties([...properties, propertyForm]);
    }
    setPropertyForm({
      photos: [],
      about: "",
      type: "",
      mls: "",
      rooms: "",
      price: "",
      sqft: "",
      lotSize: "",
      location: "",
    });
    setShowPropertyForm(false);
  }

  function handleEdit(idx) {
    setPropertyForm(properties[idx]);
    setEditIdx(idx);
    setShowPropertyForm(true);
  }

  function handleDelete(idx) {
    setProperties(properties.filter((_, i) => i !== idx));
  }

  async function UpdateContractorEnploymentStatus(employeeId, newStatus) {
    try {
      const { data, error } = await supabase
        .from("Contractor")
        .update({ employment_status: newStatus })
        .eq("employee_id", employeeId); 

      if (error) {
        console.error("Error updating application status:", error);
      } else {
        console.log("Update successful. Data:", data);
      }

      
      const { data: refetchedData, error: refetchError } = await supabase
        .from("Contractor")
        .select("*");
      if (refetchError) {
        console.error("Error refetching contractors:", refetchError);
      } else {
        setApplicationsData(refetchedData);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  }

  function handleStatusChange(employeeId, currentElement) {
    const existingDropdown = document.querySelector(".status-dropdown");
    if (existingDropdown) {
      existingDropdown.remove();
    }

    const dropdownoption = document.createElement("select");
    dropdownoption.className = "status-dropdown";

    const options = ["Application Status", "Hired", "Fired", "Pending"];

    options.forEach((option, index) => {
      const optionElement = document.createElement("option");
      optionElement.value = index === 0 ? "" : option;
      optionElement.textContent = option;
      optionElement.disabled = index === 0;
      optionElement.selected = index === 0;
      dropdownoption.appendChild(optionElement);
    });

    // Style the dropdown
    dropdownoption.style.position = "absolute";
    dropdownoption.style.top = `${currentElement.offsetTop + currentElement.offsetHeight}px`;
    dropdownoption.style.left = `${currentElement.offsetLeft}px`;
    dropdownoption.style.padding = "4px"; // Reduced padding for smaller size
    dropdownoption.style.border = "1px solid #444"; // Dark border for consistency
    dropdownoption.style.borderRadius = "4px";
    dropdownoption.style.backgroundColor = "#333"; // Dark background
    dropdownoption.style.color = "#fff"; // White text for visibility
    dropdownoption.style.fontSize = "12px"; // Smaller font size
    dropdownoption.style.cursor = "pointer";
    dropdownoption.style.zIndex = "1000"; // Ensure it appears above other elements

    dropdownoption.addEventListener("change", async () => {
      const newStatus = dropdownoption.value;
      if (newStatus) {
        await UpdateContractorEnploymentStatus(employeeId, newStatus);
        currentElement.textContent = newStatus.toUpperCase();
        currentElement.style.background =
          newStatus === "Hired" ? "#0c7400" : newStatus === "Fired" ? "#740000" : "#003d74";
        dropdownoption.remove();
      }
    });

    document.body.appendChild(dropdownoption);
  }

  async function fetchContractorSkills(employeeId) {
    try {
      console.log("Fetching skills for employee_id:", employeeId);
      const { data, error } = await supabase
        .from("Contractor") 
        .select("skills") 
        .eq("employee_id", employeeId); 

      if (error) {
        console.error("Error fetching skills:", error);
      } else if (data.length === 0) {
        console.warn("No skills found for employee_id:", employeeId);
        setcontractorSkills([]);
        setShowSkillsModal(true);
      } else {
        console.log("Fetched skills:", data[0].skills);
        setcontractorSkills(data[0].skills); 
        setShowSkillsModal(true);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  }

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
            className={`menu-item ${activeSection === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveSection("dashboard")}
          >
            <HomeIcon width={20} height={20} />
            {isSidebarOpen && <span className="menu-item-text">Dashboard</span>}
          </li>
          <li
            className={`menu-item ${activeSection === "clients" ? "active" : ""}`}
            onClick={() => setActiveSection("clients")}
          >
            <UsersIcon width={20} height={20} />
            {isSidebarOpen && <span className="menu-item-text">Clients</span>}
          </li>
          <li
            className={`menu-item ${activeSection === "jobPortal" ? "active" : ""}`}
            onClick={() => setActiveSection("jobPortal")}
          >
            <ClipboardDocumentListIcon width={20} height={20} />
            {isSidebarOpen && <span className="menu-item-text">Job Portal</span>}
          </li>
          <li
            className={`menu-item ${activeSection === "property" ? "active" : ""}`}
            onClick={() => setActiveSection("property")}
          >
            <BuildingOffice2Icon width={20} height={20} />
            {isSidebarOpen && <span className="menu-item-text">Property</span>}
          </li>
        </ul>
      </div>
      {/* Main Content */}
      <div className="ad-main-content">
        <div className="top-bar">
          <button className="ad-top-btn ad-logout-btn">
            <ArrowLeftOnRectangleIcon width={20} height={20} /> Logout
          </button>
          <Link href="/" passHref>
            <button className="ad-top-btn ad-home-btn">Home</button>
          </Link>
        </div>
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
                  className={`status-tab ${filter === "pending" ? "active" : ""}`}
                  style={{ background: statusColors.pending }}
                  onClick={() => setFilter("pending")}
                >
                  PENDING
                </button>
                <button
                  className={`status-tab ${filter === "accepted" ? "active" : ""}`}
                  style={{ background: statusColors.accepted }}
                  onClick={() => setFilter("accepted")}
                >
                  ACCEPTED
                </button>
                <button
                  className={`status-tab ${filter === "rejected" ? "active" : ""}`}
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
            <div className="contractor-list">
              {filteredApps.map((app, idx) => (
                <div className="application-card" key={idx}>
                  <div className="application-info">
                    <div className="contractor-name">{app?.name || "Unknown"}</div>
                    <div className="contractor-date">{app?.date || "N/A"}</div>
                    <div className="contractor-contact">
                      {app?.email || "N/A"} &nbsp;|&nbsp; {app?.phone_number || "N/A"}
                    </div>
                  </div>
                  {/* Contractor Actions */}
                  <div className="contractor-actions">
                    <span
                      className="contractor-status"
                      style={{
                        background: statusColors[app?.status] || "#000",
                        color: "#fff",
                        padding: "6px 12px",
                        borderRadius: "4px",
                        fontSize: "14px",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                      onClick={(event) => handleStatusChange(app?.employee_id, event.target)}
                    >
                      {app?.employment_status?.toUpperCase() || "UNKNOWN"}
                    </span>
                    <button
                      className="contractor-more-btn"
                      style={{
                        marginLeft: "8px",
                        padding: "6px 12px",
                        backgroundColor: "#444",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "14px",
                        cursor: "pointer",
                      }}
                      onClick={() => fetchContractorSkills(app?.employee_id)}
                    >
                      MORE INFO
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
                  Saved Properties:{" "}
                  {clientsData[selectedClientIdx].savedProperties}
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
                }}
              >
                + Add Property
              </button>
            </div>
            {showPropertyForm && (
              <form className="property-form" onSubmit={handlePropertySubmit}>
                <label>
                  Photos:
                  <input
                    type="file"
                    name="photos"
                    multiple
                    onChange={handlePropertyChange}
                  />
                </label>
                <label>
                  About:
                  <textarea
                    name="about"
                    value={propertyForm.about}
                    onChange={handlePropertyChange}
                  />
                </label>
                <label>
                  Type:
                  <input
                    name="type"
                    value={propertyForm.type}
                    onChange={handlePropertyChange}
                  />
                </label>
                <label>
                  MLS#:
                  <input
                    name="mls"
                    value={propertyForm.mls}
                    onChange={handlePropertyChange}
                  />
                </label>
                <label>
                  No. of Rooms:
                  <input
                    name="rooms"
                    value={propertyForm.rooms}
                    onChange={handlePropertyChange}
                  />
                </label>
                <label>
                  Price:
                  <input
                    name="price"
                    value={propertyForm.price}
                    onChange={handlePropertyChange}
                  />
                </label>
                <label>
                  Sq Feet:
                  <input
                    name="sqft"
                    value={propertyForm.sqft}
                    onChange={handlePropertyChange}
                  />
                </label>
                <label>
                  Lot Size:
                  <input
                    name="lotSize"
                    value={propertyForm.lotSize}
                    onChange={handlePropertyChange}
                  />
                </label>
                <label>
                  Location:
                  <input
                    name="location"
                    value={propertyForm.location}
                    onChange={handlePropertyChange}
                  />
                </label>
                <button type="submit">
                  {editIdx !== null ? "Update" : "Add"} Property
                </button>
                <button
                  type="button"
                  onClick={() => setShowPropertyForm(false)}
                >
                  Cancel
                </button>
              </form>
            )}
            <div className="property-list">
              {properties.map((prop, idx) => (
                <div className="property-card" key={idx}>
                  <div className="property-details">
                    <div>
                      <b>Type:</b> {prop.type}
                    </div>
                    <div>
                      <b>MLS#:</b> {prop.mls}
                    </div>
                    <div>
                      <b>Rooms:</b> {prop.rooms}
                    </div>
                    <div>
                      <b>Price:</b> {prop.price}
                    </div>
                    <div>
                      <b>Sq Feet:</b> {prop.sqft}
                    </div>
                    <div>
                      <b>Lot Size:</b> {prop.lotSize}
                    </div>
                    <div>
                      <b>Location:</b> {prop.location}
                    </div>
                    <div>
                      <b className="about">About:</b> {prop.about}
                    </div>
                    <div>
                      <b>Photos:</b>
                      {prop.photos && prop.photos.length > 0 && (
                        <div style={{ display: "flex", gap: "8px" }}>
                          {Array.from(prop.photos).map((file, i) => (
                            <img
                              key={i}
                              src={URL.createObjectURL(file)}
                              alt="property"
                              style={{
                                width: "60px",
                                height: "60px",
                                objectFit: "cover",
                                borderRadius: "8px",
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
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

        {/* Job Portal Section */}
        {activeSection === "jobPortal" && (
          <div className="job-portal-dashboard-container">
            <div className="job-portal-header-row">
              <div className="job-portal-title-row">
                <ClipboardDocumentListIcon width={38} height={38} color="#e5d7b2" />
                <h1 className="job-portal-title">Job Portal</h1>
              </div>
            </div>
            <div className="contractor-list">
              {applicationsData.map((app, idx) => (
                <div className="application-card" key={idx}>
                  <div className="application-info">
                    <div className="contractor-name">{app?.name || "Unknown"}</div>
                    <div className="contractor-date">{app?.date || "N/A"}</div>
                    <div className="contractor-contact">
                      {app?.email || "N/A"} &nbsp;|&nbsp; {app?.phone_number || "N/A"}
                    </div>
                  </div>
                  {/* Contractor Actions */}
                  <div className="contractor-actions">
                    <span
                      className="contractor-status"
                      style={{
                        background: statusColors[app?.status] || "#000",
                        color: "#fff",
                        padding: "6px 12px",
                        borderRadius: "4px",
                        fontSize: "14px",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                      onClick={(event) => handleStatusChange(app?.employee_id, event.target)}
                    >
                      {app?.employment_status?.toUpperCase() || "UNKNOWN"}
                    </span>
                    <button
                      className="contractor-more-btn"
                      style={{
                        marginLeft: "8px",
                        padding: "6px 12px",
                        backgroundColor: "#444",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "14px",
                        cursor: "pointer",
                      }}
                      onClick={() => fetchContractorSkills(app?.employee_id)}
                    >
                      MORE INFO
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills Popup */}
        {showSkillsModal && (
          <div className="skills-popup">
            <div className="skills-popup-content">
              <h2>Applicant Skills</h2>
              <p>
                {Array.isArray(contractorSkills)
                  ? contractorSkills.join(", ")
                  : contractorSkills || "No skills available."}
              </p>
              <button onClick={() => setShowSkillsModal(false)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
