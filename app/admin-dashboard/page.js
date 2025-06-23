"use client";

import Link from "next/link";
import { useState } from "react";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const chartData = {
  labels: [
    "2019", "2020", "2021", "2022", "2023", "2024"
  ],
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
        font: { size: 14 }
      }
    },
    title: {
      display: false,
    },
  },
  scales: {
    x: {
      ticks: { color: "#fff" },
      grid: { color: "rgba(255,255,255,0.1)" }
    },
    y: {
      ticks: { color: "#fff" },
      grid: { color: "rgba(255,255,255,0.1)" }
    }
  }
};

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
  <li className="menu-item active">
    <HomeIcon width={20} height={20} />
    {isSidebarOpen && <span className="menu-item-text">Dashboard</span>}
  </li>
  <li className="menu-item">
    <UsersIcon width={20} height={20} />
    {isSidebarOpen && <span className="menu-item-text">Clients</span>}
  </li>
  <li className="menu-item">
    <ClipboardDocumentListIcon width={20} height={20} />
    {isSidebarOpen && <span className="menu-item-text">Applications</span>}
  </li>
  <li className="menu-item">
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
      <button className="ad-top-btn ad-home-btn">
        Home
      </button>
    </Link>
  </div>
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
</div>
    </div>
  );
}
