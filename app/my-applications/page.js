"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../database/supabase";
import { useAuth } from "../../database/auth";
import "./styles.css";

export default function MyApplicationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Status mapping for better UX
  const getStatusDisplay = (status) => {
    switch (status?.toLowerCase()) {
      case "unemployed":
        return { text: "Pending Review", class: "status-pending" };
      case "employed":
        return { text: "Approved", class: "status-approved" };
      case "rejected":
        return { text: "Not Selected", class: "status-rejected" };
      default:
        return { text: status || "Unknown", class: "status-unknown" };
    }
  };

  // Fetch user's applications
  useEffect(() => {
    async function fetchApplications() {
      if (!user?.email) return;

      setLoading(true);
      setError("");

      try {
        const { data, error } = await supabase
          .from("Contractor")
          .select("*")
          .eq("email", user.email);

        if (error) {
          setError(`Failed to fetch applications: ${error.message}`);
          console.error("Error fetching applications:", error);
          console.error("User email:", user.email);
        } else {
          console.log("Applications fetched successfully:", data);
          setApplications(data || []);
        }
      } catch (err) {
        setError("An unexpected error occurred");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      fetchApplications();
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="applications-container">
        <div className="loading-message">Loading your applications...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="applications-container">
        <div className="auth-required">
          <h2>Please Sign In</h2>
          <p>You need to be signed in to view your job applications.</p>
          <Link href="/authentication-page" className="auth-link">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="applications-container">
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

      {/* Main Content */}
      <div className="applications-content">
        <div className="applications-header">
          <h1>My Job Applications</h1>
          <p>Track the status of your career applications</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {applications.length === 0 && !loading && !error && (
          <div className="no-applications">
            <h3>No Applications Found</h3>
            <p>You haven&apos;t submitted any job applications yet.</p>
            <Link href="/careers" className="apply-now-btn">
              Browse Career Opportunities
            </Link>
          </div>
        )}

        {applications.length > 0 && (
          <div className="applications-grid">
            {applications.map((application, idx) => {
              const statusInfo = getStatusDisplay(
                application.employment_status
              );

              return (
                <div
                  key={
                    application.employee_id || application.contractor_id || idx
                  }
                  className="application-card"
                >
                  <div className="application-header">
                    <h3 className="application-position">
                      Career Application #
                      {application.employee_id ||
                        application.contractor_id ||
                        `temp-${idx}`}
                    </h3>
                    <span className={`application-status ${statusInfo.class}`}>
                      {statusInfo.text}
                    </span>
                  </div>

                  <div className="application-details">
                    <div className="detail-row">
                      <span className="detail-label">Name:</span>
                      <span className="detail-value">{application.name}</span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">{application.email}</span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Phone:</span>
                      <span className="detail-value">
                        {application.phone_number || "Not provided"}
                      </span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Skills:</span>
                      <span className="detail-value">
                        {application.skills || "Not specified"}
                      </span>
                    </div>

                    {(application.created_at || application.date) && (
                      <div className="detail-row">
                        <span className="detail-label">Applied on:</span>
                        <span className="detail-value">
                          {new Date(
                            application.created_at || application.date
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="application-footer">
                    {statusInfo.text === "Pending Review" && (
                      <p className="status-message">
                        Your application is being reviewed. We&apos;ll contact you
                        soon!
                      </p>
                    )}
                    {statusInfo.text === "Approved" && (
                      <p className="status-message success">
                        Congratulations! Your application has been approved.
                        Check your email for next steps.
                      </p>
                    )}
                    {statusInfo.text === "Not Selected" && (
                      <p className="status-message">
                        Thank you for your interest. We&apos;ll keep your application
                        on file for future opportunities.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="applications-actions">
          <Link href="/careers" className="btn btn-primary">
            Apply for More Positions
          </Link>
        </div>
      </div>
    </div>
  );
}
