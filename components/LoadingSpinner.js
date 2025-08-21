"use client";

export default function LoadingSpinner() {
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
      }}
    >
      <div
        style={{
          width: "50px",
          height: "50px",
          border: "3px solid #333",
          borderTop: "3px solid #bfa76a",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginBottom: "20px",
        }}
      />
      <div style={{ fontSize: "1.2rem" }}>Loading...</div>

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
