export default function GlobalHeader() {
  return (
    <div
      style={{
        width: "100%",
        textAlign: "center",
        padding: "15px 10px",
        background: "#ffffff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      {/* Logo from PUBLIC folder */}
      <img
        src="/college-logo.png"
        alt="College Logo"
        style={{ width: "70px", marginBottom: "6px" }}
      />

      {/* Branch */}
      <div style={{ fontWeight: "600", fontSize: "15px" }}>
        CSE (CYS, DS) and AI & DS
      </div>

      {/* Year */}
      <div style={{ fontSize: "13px", color: "#555" }}>
        For 3rd and 4th Year Students
      </div>
    </div>
  );
}