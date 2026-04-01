import { useEffect, useState } from "react";
import API from "../api/api";

export default function StudentDrives() {
  const [drives, setDrives] = useState([]);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState("");

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    try {
      setLoading(true);
      const res = await API.get("/drives");
      setDrives(res.data);
    } catch (error) {
      setMessage("Failed to fetch drives");
    } finally {
      setLoading(false);
    }
  };

  const applyToDrive = async (driveId) => {
    try {
      setApplyingId(driveId);

      const formData = new FormData();
      formData.append("driveId", driveId);

      const res = await API.post("/applications", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage(res.data.message || "Applied successfully");

      setDrives((prev) =>
        prev.map((drive) =>
          drive._id === driveId
            ? { ...drive, alreadyApplied: true }
            : drive
        )
      );

      setSelectedDrive((prev) =>
        prev && prev._id === driveId
          ? { ...prev, alreadyApplied: true }
          : prev
      );
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to apply");
    } finally {
      setApplyingId("");
    }
  };

  const openApplicationLink = (link) => {
    if (!link) return;
    window.open(link, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return <p>Loading drives...</p>;
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <h2 style={styles.title}>Drives Information</h2>
        <p style={styles.subtitle}>
          View available placement drives and apply from here.
        </p>
      </div>

      {message && <p style={styles.message}>{message}</p>}

      {!selectedDrive ? (
        <div style={styles.grid}>
          {drives.length > 0 ? (
            drives.map((drive) => (
              <div key={drive._id} style={styles.card}>
                {drive.image ? (
                  <img
                    src={drive.image}
                    alt={drive.companyName}
                    style={styles.image}
                  />
                ) : (
                  <div style={styles.placeholderLogo}>No Logo</div>
                )}

                <h3 style={styles.cardTitle}>{drive.title}</h3>

                <p style={styles.text}>
                  <strong>Company:</strong> {drive.companyName}
                </p>

                <p style={styles.text}>
                  <strong>Date:</strong>{" "}
                  {drive.date ? new Date(drive.date).toDateString() : "N/A"}
                </p>

                <div style={styles.badgeRow}>
                  {drive.alreadyApplied && (
                    <span style={styles.appliedBadge}>Applied</span>
                  )}
                  {drive.isEligible === false && (
                    <span style={styles.notEligibleBadge}>Not Eligible</span>
                  )}
                </div>

                <div style={styles.cardButtons}>
                  <button
                    style={styles.viewButton}
                    onClick={() => setSelectedDrive(drive)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No drives available</p>
          )}
        </div>
      ) : (
        <div style={styles.detailsCard}>
          {selectedDrive.image ? (
            <img
              src={selectedDrive.image}
              alt={selectedDrive.companyName}
              style={styles.detailImage}
            />
          ) : (
            <div style={styles.detailPlaceholderLogo}>No Logo</div>
          )}

          <h3 style={styles.detailTitle}>{selectedDrive.title}</h3>

          <p style={styles.text}>
            <strong>Company Name:</strong> {selectedDrive.companyName || "N/A"}
          </p>
          <p style={styles.text}>
            <strong>Date:</strong>{" "}
            {selectedDrive.date
              ? new Date(selectedDrive.date).toDateString()
              : "N/A"}
          </p>
          <p style={styles.text}>
            <strong>Role:</strong> {selectedDrive.role || "N/A"}
          </p>
          <p style={styles.text}>
            <strong>Package:</strong> {selectedDrive.package || "N/A"}
          </p>
          <p style={styles.text}>
            <strong>Minimum CGPA:</strong> {selectedDrive.minCGPA ?? "N/A"}
          </p>
          <p style={styles.text}>
            <strong>Max Backlogs:</strong> {selectedDrive.maxBacklogs ?? "N/A"}
          </p>
          <p style={styles.text}>
            <strong>Allowed Branches:</strong>{" "}
            {Array.isArray(selectedDrive.allowedBranches) &&
            selectedDrive.allowedBranches.length > 0
              ? selectedDrive.allowedBranches.join(", ")
              : "All"}
          </p>
          <p style={styles.text}>
            <strong>Required Skills:</strong>{" "}
            {Array.isArray(selectedDrive.requiredSkills)
              ? selectedDrive.requiredSkills.join(", ")
              : selectedDrive.requiredSkills || "N/A"}
          </p>
          <p style={styles.text}>
            <strong>Description:</strong> {selectedDrive.description || "N/A"}
          </p>
          <p style={styles.text}>
            <strong>Application Link:</strong>{" "}
            {selectedDrive.applicationLink ? selectedDrive.applicationLink : "N/A"}
          </p>

          {selectedDrive.alreadyApplied && (
            <p style={styles.appliedText}>
              You have already applied for this drive.
            </p>
          )}

          {selectedDrive.isEligible === false && (
            <p style={styles.notEligibleText}>
              You are not eligible for this drive.
            </p>
          )}

          <div style={styles.detailButtons}>
            <button
              style={styles.backButton}
              onClick={() => setSelectedDrive(null)}
            >
              Back
            </button>

            {selectedDrive.applicationLink && (
              <button
                style={styles.linkButton}
                onClick={() => openApplicationLink(selectedDrive.applicationLink)}
              >
                Apply Here
              </button>
            )}

            <button
              style={{
                ...styles.applyButton,
                opacity:
                  selectedDrive.alreadyApplied || selectedDrive.isEligible === false
                    ? 0.6
                    : 1,
                cursor:
                  selectedDrive.alreadyApplied || selectedDrive.isEligible === false
                    ? "not-allowed"
                    : "pointer",
              }}
              disabled={
                selectedDrive.alreadyApplied ||
                selectedDrive.isEligible === false ||
                applyingId === selectedDrive._id
              }
              onClick={() => applyToDrive(selectedDrive._id)}
            >
              {selectedDrive.alreadyApplied
                ? "Applied"
                : applyingId === selectedDrive._id
                ? "Applying..."
                : "Apply"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    width: "100%",
  },
  header: {
    marginBottom: "20px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "8px",
    color: "#0f172a",
  },
  subtitle: {
    color: "#475569",
    fontSize: "15px",
  },
  message: {
    marginBottom: "16px",
    color: "#0f766e",
    fontWeight: "600",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    padding: "18px",
    boxShadow: "0 6px 20px rgba(15, 23, 42, 0.08)",
  },
  image: {
    width: "100%",
    height: "180px",
    objectFit: "contain",
    borderRadius: "12px",
    marginBottom: "14px",
    background: "#f8fafc",
    padding: "12px",
  },
  placeholderLogo: {
    width: "100%",
    height: "180px",
    borderRadius: "12px",
    marginBottom: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#e2e8f0",
    color: "#475569",
    fontWeight: "600",
  },
  cardTitle: {
    fontSize: "20px",
    marginBottom: "10px",
    color: "#0f172a",
  },
  text: {
    color: "#334155",
    marginBottom: "8px",
  },
  badgeRow: {
    display: "flex",
    gap: "8px",
    marginTop: "8px",
    marginBottom: "10px",
    flexWrap: "wrap",
  },
  appliedBadge: {
    background: "#dcfce7",
    color: "#166534",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700",
  },
  notEligibleBadge: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700",
  },
  cardButtons: {
    marginTop: "14px",
  },
  viewButton: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
  },
  detailsCard: {
    background: "#fff",
    borderRadius: "18px",
    padding: "24px",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
  },
  detailImage: {
    width: "100%",
    maxWidth: "260px",
    height: "180px",
    objectFit: "contain",
    borderRadius: "12px",
    background: "#f8fafc",
    padding: "12px",
    marginBottom: "18px",
  },
  detailPlaceholderLogo: {
    width: "100%",
    maxWidth: "260px",
    height: "180px",
    borderRadius: "12px",
    marginBottom: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#e2e8f0",
    color: "#475569",
    fontWeight: "600",
  },
  detailTitle: {
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "14px",
    color: "#0f172a",
  },
  appliedText: {
    color: "#166534",
    fontWeight: "700",
    marginTop: "10px",
  },
  notEligibleText: {
    color: "#b91c1c",
    fontWeight: "700",
    marginTop: "10px",
  },
  detailButtons: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "20px",
  },
  backButton: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "10px",
    background: "#64748b",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
  },
  linkButton: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "10px",
    background: "#0f766e",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
  },
  applyButton: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "10px",
    background: "#16a34a",
    color: "#fff",
    fontWeight: "600",
  },
};