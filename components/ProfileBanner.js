"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "../database/auth";
import { supabase } from "../database/supabase";
import "./ProfileBanner.css";

export default function ProfileBanner() {
  const { user, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showChangeUsername, setShowChangeUsername] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [username, setUsername] = useState("");
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Get user's first name or email for display
  const displayName = username || user?.email?.split("@")[0] || "User";

  // Fetch user's current username
  useEffect(() => {
    if (user) {
      fetchUsername();
    }
  }, [user]);

  const fetchUsername = async () => {
    try {
      const { data, error } = await supabase
        .from("Buyer")
        .select("name")
        .eq("buyer_id", user.id)
        .single();

      if (data?.name) {
        setUsername(data.name);
      }
    } catch (err) {
      console.log("Could not fetch username:", err);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    setError("");
    setSuccess("");
  };

  const handleChangeUsername = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Username cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("Buyer")
        .update({ name: username })
        .eq("buyer_id", user.id);

      if (error) throw error;

      setSuccess("Username updated successfully!");
      setShowChangeUsername(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");

    if (passwords.new !== passwords.confirm) {
      setError("New passwords don't match");
      return;
    }

    if (passwords.new.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new,
      });

      if (error) throw error;

      setSuccess("Password updated successfully!");
      setShowChangePassword(false);
      setPasswords({ current: "", new: "", confirm: "" });
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      // Delete user data from Buyer table
      await supabase.from("Buyer").delete().eq("buyer_id", user.id);

      // Note: Supabase doesn't allow deleting auth users from client side
      // In a real app, you'd call a server function to delete the auth user
      setSuccess(
        "Account deletion initiated. Please contact support to complete the process."
      );
      setTimeout(() => {
        signOut();
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForms = () => {
    setShowChangePassword(false);
    setShowChangeUsername(false);
    setShowDeleteAccount(false);
    setPasswords({ current: "", new: "", confirm: "" });
    setError("");
    setSuccess("");
  };

  if (!user) return null;

  return (
    <div className="profile-banner" ref={dropdownRef}>
      <button className="profile-trigger" onClick={toggleDropdown}>
        <div className="profile-avatar">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <span className="profile-name">{displayName}</span>
        <svg
          className={`profile-chevron ${isDropdownOpen ? "rotated" : ""}`}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6,9 12,15 18,9"></polyline>
        </svg>
      </button>

      {isDropdownOpen && (
        <div className="profile-dropdown">
          {error && <div className="profile-error">{error}</div>}
          {success && <div className="profile-success">{success}</div>}

          {!showChangeUsername && !showChangePassword && !showDeleteAccount && (
            <div className="profile-menu">
              <button
                className="profile-menu-item"
                onClick={() => setShowChangeUsername(true)}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Change Username
              </button>

              <button
                className="profile-menu-item"
                onClick={() => setShowChangePassword(true)}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect
                    x="3"
                    y="11"
                    width="18"
                    height="11"
                    rx="2"
                    ry="2"
                  ></rect>
                  <circle cx="12" cy="16" r="1"></circle>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                Change Password
              </button>

              <button
                className="profile-menu-item danger"
                onClick={() => setShowDeleteAccount(true)}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="3,6 5,6 21,6"></polyline>
                  <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                </svg>
                Delete Account
              </button>

              <hr className="profile-divider" />

              <button className="profile-menu-item" onClick={() => signOut()}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16,17 21,12 16,7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Sign Out
              </button>
            </div>
          )}

          {showChangeUsername && (
            <form onSubmit={handleChangeUsername} className="profile-form">
              <h4>Change Username</h4>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter new username"
                className="profile-input"
                disabled={loading}
              />
              <div className="profile-form-buttons">
                <button
                  type="button"
                  onClick={resetForms}
                  className="profile-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="profile-btn-primary"
                >
                  {loading ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          )}

          {showChangePassword && (
            <form onSubmit={handleChangePassword} className="profile-form">
              <h4>Change Password</h4>
              <input
                type="password"
                value={passwords.new}
                onChange={(e) =>
                  setPasswords({ ...passwords, new: e.target.value })
                }
                placeholder="New password"
                className="profile-input"
                disabled={loading}
              />
              <input
                type="password"
                value={passwords.confirm}
                onChange={(e) =>
                  setPasswords({ ...passwords, confirm: e.target.value })
                }
                placeholder="Confirm new password"
                className="profile-input"
                disabled={loading}
              />
              <div className="profile-form-buttons">
                <button
                  type="button"
                  onClick={resetForms}
                  className="profile-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="profile-btn-primary"
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          )}

          {showDeleteAccount && (
            <div className="profile-form">
              <h4>Delete Account</h4>
              <p className="profile-warning">
                This action cannot be undone. All your data will be permanently
                deleted.
              </p>
              <div className="profile-form-buttons">
                <button
                  type="button"
                  onClick={resetForms}
                  className="profile-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="profile-btn-danger"
                >
                  {loading ? "Deleting..." : "Delete Account"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
