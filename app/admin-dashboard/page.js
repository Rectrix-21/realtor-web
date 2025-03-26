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

export default function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
          <li className="menu-item">
            <HomeIcon width={20} height={20} />
            {isSidebarOpen && <span className="menu-item-text">Dashboard</span>}
          </li>
          <li className="menu-item">
            <UsersIcon width={20} height={20} />
            {isSidebarOpen && <span className="menu-item-text">Clients</span>}
          </li>
          <li className="menu-item">
            <ClipboardDocumentListIcon width={20} height={20} />
            {isSidebarOpen && (
              <span className="menu-item-text">Applications</span>
            )}
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
          <Link href="/">
            <button className="ad-top-btn ad-home-btn">
              <HomeIcon width={20} height={20} /> Home
            </button>
          </Link>
          <Link href="/authentication-page">
            <button className="ad-top-btn ad-logout-btn">
              <ArrowLeftOnRectangleIcon width={20} height={20} /> Logout
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
