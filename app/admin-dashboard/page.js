"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, use } from "react";
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
import { supabase } from "../../database/supabase.js";
import { useAuth } from "../../database/auth.js";
import { useRouter } from "next/navigation";

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
  unemployed: "#003d74", // Pending - blue
  employed: "#0c7400", // Approved - green
  rejected: "#740000", // Rejected - red
  pending: "#003d74", // Keep for backwards compatibility
  approved: "#0c7400", // Keep for backwards compatibility
  disapproved: "#740000", // Keep for backwards compatibility
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
  const { role, loading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedClientIdx, setSelectedClientIdx] = useState(0);

  // property state
  const [properties, setProperties] = useState([]);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [editIdx, setEditIdx] = useState(null); // UI index
  const [editingId, setEditingId] = useState(null); // DB primary key (property_id)
  const [uploadedFiles, setUploadedFiles] = useState([]); // storage paths for cleanup

  //applications state
  const [applicationsData, setApplicationsData] = useState([]);
  const [contractorSkills, setcontractorSkills] = useState([]);
  const [showSkillsModal, setShowSkillsModal] = useState(false);

  // Helper function to convert status text to database codes
  function getStatusCode(statusText) {
    // Safety check: ensure statusText is a string
    if (!statusText || typeof statusText !== "string") {
      return 1; // default to 1 (active) if statusText is invalid
    }

    const statusMap = {
      active: 1,
      sold: 2,
      pending: 3,
      inactive: 4,
      available: 1, // alias for active
      unavailable: 4, // alias for inactive
    };

    const normalizedStatus = statusText.toLowerCase().trim();
    return statusMap[normalizedStatus] || 1; // default to 1 (active) if unknown
  }

  // Helper function to convert status codes back to text for display
  function getStatusText(statusCode) {
    const codeMap = {
      1: "Active",
      2: "Sold",
      3: "Pending",
      4: "Inactive",
    };

    return codeMap[statusCode] || "Active";
  }

  // Helper function to validate basement type
  function getValidBasementType(basementType) {
    // Safety check: ensure basementType is a string
    if (!basementType || typeof basementType !== "string") {
      return "c"; // Default for invalid input
    }

    // The database constraint allows: 'c', 'w', 'f', 'p'
    // These likely mean: c=crawl/concrete, w=walkout, f=full, p=partial
    const validValues = ["c", "w", "f", "p"];

    const normalizedType = basementType.trim().toLowerCase();

    if (!normalizedType) {
      return "c"; // Default for empty
    }

    // Check exact match first
    if (validValues.includes(normalizedType)) {
      return normalizedType;
    }

    // Try to map common inputs to valid codes
    const input = normalizedType;
    if (input.includes("full") || input.includes("finished")) return "f";
    if (input.includes("partial")) return "p";
    if (input.includes("walkout")) return "w";
    if (
      input.includes("crawl") ||
      input.includes("concrete") ||
      input.includes("none") ||
      input.includes("no")
    )
      return "c";

    // Single character inputs
    if (input === "f" || input === "full") return "f";
    if (input === "p" || input === "partial") return "p";
    if (input === "w" || input === "walkout") return "w";
    if (input === "c" || input === "crawl" || input === "none") return "c";

    // Last resort - return safe default
    return "c";
  }

  // Helper function to validate property kind (must be exactly 1 character)
  function getValidPropertyKind(propertyKind) {
    // Safety check: ensure propertyKind is a string
    if (!propertyKind || typeof propertyKind !== "string") {
      return "H"; // Default for invalid input (House)
    }

    const normalizedType = propertyKind.trim();

    if (!normalizedType) {
      return "H"; // Default for empty (House)
    }

    // If it's already 1 character, return it uppercase
    if (normalizedType.length === 1) {
      return normalizedType.toUpperCase();
    }

    // If longer, try to map common property types to single letters
    const input = normalizedType.toLowerCase();
    if (input.includes("house") || input.includes("home")) return "H";
    if (input.includes("condo") || input.includes("condominium")) return "C";
    if (input.includes("town") || input.includes("townhouse")) return "T";
    if (input.includes("apartment") || input.includes("apt")) return "A";
    if (input.includes("land") || input.includes("lot")) return "L";
    if (input.includes("duplex")) return "D";
    if (input.includes("villa")) return "V";
    if (input.includes("mobile") || input.includes("manufactured")) return "M";

    // Default: take first character and capitalize
    return normalizedType.charAt(0).toUpperCase();
  }

  // variable to watch for
  const [currentRole, setCurrentRole] = useState(null);

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
    // NEW: price
    price: "",
  });

  console.log("User role:", role);

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

  useEffect(() => {
    async function fetchContractors() {
      const { data, error } = await supabase.from("Contractor").select("*");
      if (error) {
        console.error("Error fetching contractors:", error);
      } else {
        setApplicationsData(data);
        console.log("Contractors fetched:", data);
      }
    }

    fetchContractors();
  }, []);

  useEffect(() => {
    //log images
    console.log("Uploaded files:", uploadedFiles);
    console.log("Property form data:", propertyForm);
  }, [uploadedFiles, propertyForm]);

  if (loading) {
    return (
      <div className="loading-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (role !== "admin") {
    router.push("/"); // redirect if not admin
    return null; // prevent rendering anything else
  }

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
    if (filter !== "all" && app.employment_status?.toLowerCase() !== filter)
      return false;
    if (search && !app.name?.toLowerCase().includes(search.toLowerCase()))
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
    console.log("Submitting property form with data:", propertyForm);
    console.log("editingId:", editingId);
    console.log("editIdx:", editIdx);

    const body = {
      ...propertyForm,
      // Handle UUID fields - convert empty strings to null
      buyer_id:
        propertyForm.buyer_id && propertyForm.buyer_id.trim() !== ""
          ? propertyForm.buyer_id
          : null,
      // cast numeric fields
      rooms: propertyForm.rooms !== "" ? parseInt(propertyForm.rooms) : null,
      status:
        propertyForm.status !== "" ? getStatusCode(propertyForm.status) : 1, // Convert text to status code
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
        propertyForm.lot_size !== "" ? parseInt(propertyForm.lot_size) : 0, // Default to 0 if empty
      price: propertyForm.price !== "" ? parseInt(propertyForm.price) : null,
      // Handle text fields - convert empty strings to valid defaults where appropriate
      basement_type:
        propertyForm.basement_type && propertyForm.basement_type.trim() !== ""
          ? getValidBasementType(propertyForm.basement_type)
          : "c", // Use valid constraint value: c, w, f, or p
      property_kind:
        propertyForm.property_kind && propertyForm.property_kind.trim() !== ""
          ? getValidPropertyKind(propertyForm.property_kind)
          : getValidPropertyKind(""), // Use helper function to ensure valid 1-character value
      description:
        propertyForm.description && propertyForm.description.trim() !== ""
          ? propertyForm.description
          : null,
    };

    console.log("Processed body for submission:", body);

    try {
      if (editingId) {
        console.log("Updating property with ID:", editingId);
        const result = await updateProperty(editingId, body);
        console.log("Update result:", result);
      } else {
        console.log("Creating new property");
        const result = await insertProperty(body);
        console.log("Insert result:", result);
      }

      console.log("Refreshing properties list...");
      const rows = await getProperties();
      setProperties(rows);
      setUploadedFiles([]);

      console.log("Property operation completed successfully");
    } catch (err) {
      console.error("Save failed:", err.message);
      console.error("Full error:", err);
      alert(`Save failed: ${err.message}`);
      return; // Don't reset form if there was an error
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
      price: "",
    });
    setEditIdx(null);
    setEditingId(null);
    setUploadedFiles([]);
  }

  function handleEdit(idx) {
    const row = properties[idx];
    console.log("Editing property:", row);
    console.log(
      "Property ID:",
      row.property_id,
      "Type:",
      typeof row.property_id
    );

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
      price: row.price ?? "",
    });
    setEditIdx(idx);
    setEditingId(row.property_id);
    setShowPropertyForm(true);
    setUploadedFiles([]);

    console.log(
      "Edit state set - editingId:",
      row.property_id,
      "editIdx:",
      idx
    );
  }

  async function handleDelete(idx) {
    const row = properties[idx];
    console.log("Delete request - idx:", idx, "row:", row);
    console.log("Properties array:", properties);

    if (!row?.property_id) {
      alert("Error: Property ID not found");
      return;
    }

    // Confirm deletion
    const confirmDelete = confirm(
      `Are you sure you want to delete this property?\n\nID: ${row.property_id}\n\nThis will also remove:\n- Any bookmarks for this property\n- Any viewing requests for this property\n\nThis action cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      console.log(
        "Deleting property with ID:",
        row.property_id,
        "Type:",
        typeof row.property_id
      );
      await deleteProperty(row.property_id);

      // Refresh the properties list
      const rows = await getProperties();
      setProperties(rows);

      console.log("Property deleted successfully");
      alert("Property deleted successfully!");
    } catch (e) {
      console.error("Delete failed:", e.message);
      alert(`Delete failed: ${e.message}`);
    }
  }

  async function UpdateContractorEmploymentStatus(employeeId, newStatus) {
    try {
      const { data, error } = await supabase
        .from("Contractor")
        .update({ employment_status: newStatus })
        .eq("employee_id", employeeId);

      if (error) {
        console.error("Error updating application status:", error);
        return false;
      } else {
        console.log("Update successful. Data:", data);

        // Force a complete refresh of the contractors data
        const { data: refetchedData, error: refetchError } = await supabase
          .from("Contractor")
          .select("*");
        if (refetchError) {
          console.error("Error refetching contractors:", refetchError);
          return false;
        } else {
          setApplicationsData(refetchedData);
          return true;
        }
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      return false;
    }
  }

  async function fetchContractorSkills(employeeId) {
    try {
      const { data, error } = await supabase
        .from("Contractor")
        .select("skills")
        .eq("employee_id", employeeId)
        .single();

      if (error) {
        console.error("Error fetching contractor skills:", error);
        setcontractorSkills("Error loading skills");
      } else {
        setcontractorSkills(data.skills || "No skills available");
      }
      setShowSkillsModal(true);
    } catch (err) {
      console.error("Unexpected error fetching skills:", err);
      setcontractorSkills("Error loading skills");
      setShowSkillsModal(true);
    }
  }

  async function handleStatusChange(employeeId, newStatus) {
    if (!newStatus) return;

    const success = await UpdateContractorEmploymentStatus(
      employeeId,
      newStatus
    );
    if (success) {
      console.log(
        `Successfully updated contractor ${employeeId} to ${newStatus}`
      );
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
              activeSection === "jobPortal" ? "active" : ""
            }`}
            onClick={() => setActiveSection("jobPortal")}
          >
            <ClipboardDocumentListIcon width={20} height={20} />
            {isSidebarOpen && (
              <span className="menu-item-text">Job Portal</span>
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
                    filter === "approved" ? "active" : ""
                  }`}
                  style={{ background: statusColors.approved }}
                  onClick={() => setFilter("approved")}
                >
                  APPROVED
                </button>
                <button
                  className={`status-tab ${
                    filter === "disapproved" ? "active" : ""
                  }`}
                  style={{ background: statusColors.disapproved }}
                  onClick={() => setFilter("disapproved")}
                >
                  DISAPPROVED
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
            <div className="applications-content">
              <div className="contractor-list">
                {filteredApps.map((app, idx) => (
                  <div className="application-card" key={idx}>
                    <div className="application-info">
                      <div className="contractor-name">
                        {app?.name || "Unknown"}
                      </div>
                      <div className="contractor-contact">
                        {app?.email || "N/A"} &nbsp;|&nbsp;{" "}
                        {app?.phone_number || "N/A"}
                      </div>
                    </div>
                    {/* Contractor Actions */}
                    <div className="contractor-actions">
                      <select
                        className="contractor-status"
                        style={{
                          background:
                            statusColors[
                              app?.employment_status?.toLowerCase()
                            ] || "#000",
                          color: "#fff",
                          padding: "6px 12px",
                          borderRadius: "4px",
                          fontSize: "14px",
                          fontWeight: "bold",
                          cursor: "pointer",
                          border: "none",
                          outline: "none",
                        }}
                        value={app?.employment_status || "unemployed"}
                        onChange={(e) =>
                          handleStatusChange(app?.employee_id, e.target.value)
                        }
                      >
                        <option value="unemployed">PENDING</option>
                        <option value="employed">APPROVED</option>
                        <option value="rejected">REJECTED</option>
                      </select>
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
              {/* Skills Panel on the Right */}
              {showSkillsModal && (
                <div className="skills-right-panel">
                  <div className="skills-panel-header">
                    <h3>Applicant Skills</h3>
                    <button
                      className="close-btn"
                      onClick={() => setShowSkillsModal(false)}
                    >
                      ×
                    </button>
                  </div>
                  <div className="skills-panel-content">
                    <p>
                      {Array.isArray(contractorSkills)
                        ? contractorSkills.join(", ")
                        : contractorSkills || "No skills available."}
                    </p>
                  </div>
                </div>
              )}
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
                  "description",
                  "sq_feet",
                  "lot_size",
                  "price",
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

                {/* Dropdown for Basement Type */}
                <label>
                  Basement Type:
                  <select
                    name="basement_type"
                    value={propertyForm.basement_type}
                    onChange={handlePropertyFieldChange}
                  >
                    <option value="">Select Basement Type</option>
                    <option value="c">Concrete (c)</option>
                    <option value="w">Wood (w)</option>
                    <option value="f">Finished (f)</option>
                    <option value="p">Partial (p)</option>
                  </select>
                </label>

                {/* Dropdown for Property Kind */}
                <label>
                  Property Kind:
                  <select
                    name="property_kind"
                    value={propertyForm.property_kind}
                    onChange={handlePropertyFieldChange}
                  >
                    <option value="">Select Property Type</option>
                    <option value="H">House (H)</option>
                    <option value="C">Condo (C)</option>
                    <option value="T">Townhouse (T)</option>
                    <option value="A">Apartment (A)</option>
                    <option value="L">Land/Lot (L)</option>
                    <option value="D">Duplex (D)</option>
                    <option value="V">Villa (V)</option>
                    <option value="M">Mobile/Manufactured (M)</option>
                  </select>
                </label>

                {/* Live preview of uploaded images */}
                {propertyForm.image_urls.length > 0 && (
                  <div style={{ display: "flex", gap: 8, margin: "8px 0" }}>
                    {propertyForm.image_urls.map((url, i) => (
                      <Image
                        key={i}
                        src={url}
                        alt="property"
                        width={60}
                        height={60}
                        style={{
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
                                  <Image
                                    key={i}
                                    src={url}
                                    alt="property"
                                    width={60}
                                    height={60}
                                    style={{
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

        {/* Job Portal Section */}
        {activeSection === "jobPortal" && (
          <div className="job-portal-dashboard-container">
            <div className="job-portal-header-row">
              <div className="job-portal-title-row">
                <ClipboardDocumentListIcon
                  width={38}
                  height={38}
                  color="#e5d7b2"
                />
                <h1 className="job-portal-title">Job Portal</h1>
              </div>
            </div>
            <div className="job-portal-content">
              <div className="contractor-list">
                {applicationsData.map((app, idx) => (
                  <div className="application-card" key={idx}>
                    <div className="application-info">
                      <div className="contractor-name">
                        {app?.name || "Unknown"}
                      </div>
                      <div className="contractor-date">
                        {app?.date || "N/A"}
                      </div>
                      <div className="contractor-contact">
                        {app?.email || "N/A"} &nbsp;|&nbsp;{" "}
                        {app?.phone_number || "N/A"}
                      </div>
                    </div>
                    {/* Contractor Actions */}
                    <div className="contractor-actions">
                      <select
                        className="contractor-status"
                        style={{
                          background:
                            statusColors[
                              app?.employment_status?.toLowerCase()
                            ] || "#000",
                          color: "#fff",
                          padding: "6px 12px",
                          borderRadius: "4px",
                          fontSize: "14px",
                          fontWeight: "bold",
                          cursor: "pointer",
                          border: "none",
                          outline: "none",
                        }}
                        value={app?.employment_status || "unemployed"}
                        onChange={(e) =>
                          handleStatusChange(app?.employee_id, e.target.value)
                        }
                      >
                        <option value="unemployed">PENDING</option>
                        <option value="employed">APPROVED</option>
                        <option value="rejected">REJECTED</option>
                      </select>
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
              {/* Skills Panel on the Right */}
              {showSkillsModal && (
                <div className="skills-right-panel">
                  <div className="skills-panel-header">
                    <h3>Applicant Skills</h3>
                    <button
                      className="close-btn"
                      onClick={() => setShowSkillsModal(false)}
                    >
                      ×
                    </button>
                  </div>
                  <div className="skills-panel-content">
                    <p>
                      {Array.isArray(contractorSkills)
                        ? contractorSkills.join(", ")
                        : contractorSkills || "No skills available."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
