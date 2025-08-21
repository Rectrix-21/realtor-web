"use client";
import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            background:
              "linear-gradient(125deg, #000000 0%, #241b0c 50%, #000000 100%)",
            color: "#fff",
            fontFamily: '"Poppins", sans-serif',
            padding: "20px",
            textAlign: "center",
          }}
        >
          <h2 style={{ color: "#bfa76a", marginBottom: "20px" }}>
            Something went wrong
          </h2>
          <p style={{ marginBottom: "30px", maxWidth: "500px" }}>
            We&apos;re having trouble loading the page. This could be due to a
            network issue or temporary service interruption.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "#bfa76a",
              color: "#000",
              border: "none",
              padding: "12px 30px",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "background 0.3s ease",
            }}
            onMouseOver={(e) => (e.target.style.background = "#d4be7a")}
            onMouseOut={(e) => (e.target.style.background = "#bfa76a")}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
