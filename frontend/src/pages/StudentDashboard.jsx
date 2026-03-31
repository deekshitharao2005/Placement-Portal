import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentProfile from "./StudentProfile";
import StudentReport from "./StudentReport";
import StudentDrives from "./StudentDrives";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

if (!token || role?.toLowerCase() !== "student") {
  navigate("/student/login");
}
  }, [navigate]);

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <StudentProfile />;
      case "report":
        return <StudentReport />;
      case "drives":
        return <StudentDrives />;
      default:
        return <StudentProfile />;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/student/login");
  };

  return (
    <div style={styles.wrapper}>
      <aside style={styles.sidebar}>
        <div>
          <h2 style={styles.logo}>Student Panel</h2>
          <p style={styles.sidebarSubtitle}>Placement Portal</p>
        </div>

        <div style={styles.navGroup}>
          <button
            style={{
              ...styles.navButton,
              ...(activeTab === "profile" ? styles.activeButton : {}),
            }}
            onClick={() => setActiveTab("profile")}
          >
            Student Profile
          </button>

          <button
            style={{
              ...styles.navButton,
              ...(activeTab === "report" ? styles.activeButton : {}),
            }}
            onClick={() => setActiveTab("report")}
          >
            Student Report
          </button>

          <button
            style={{
              ...styles.navButton,
              ...(activeTab === "drives" ? styles.activeButton : {}),
            }}
            onClick={() => setActiveTab("drives")}
          >
            Drives Information
          </button>
        </div>

        <button style={styles.logoutButton} onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main style={styles.content}>{renderContent()}</main>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    minHeight: "100vh",
    background: "#f8fafc",
  },
  sidebar: {
    width: "270px",
    background: "#0f172a",
    color: "#fff",
    padding: "24px 16px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxShadow: "2px 0 14px rgba(0,0,0,0.08)",
  },
  logo: {
    fontSize: "26px",
    fontWeight: "700",
    marginBottom: "6px",
  },
  sidebarSubtitle: {
    fontSize: "13px",
    color: "#cbd5e1",
    marginBottom: "24px",
  },
  navGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  navButton: {
    padding: "14px 16px",
    border: "none",
    borderRadius: "12px",
    background: "transparent",
    color: "#fff",
    textAlign: "left",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },
  activeButton: {
    background: "#2563eb",
  },
  logoutButton: {
    marginTop: "20px",
    padding: "12px 16px",
    border: "none",
    borderRadius: "12px",
    background: "#dc2626",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
  },
  content: {
    flex: 1,
    padding: "32px",
  },
};