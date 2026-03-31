import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/api";

export default function DriveDetails() {
  const { id } = useParams();

  const [applications, setApplications] = useState([]);
  const [drive, setDrive] = useState(null);
  const [message, setMessage] = useState("");

  // 🔥 Fetch drive info
  const fetchDrive = async () => {
    try {
      const res = await API.get(`/drives/${id}`);
      setDrive(res.data);
    } catch (err) {
      console.log("Drive fetch error");
    }
  };

  // 🔥 Fetch applicants
  const fetchApplicants = async () => {
    try {
      const res = await API.get(`/applications/drive/${id}`);
      setApplications(res.data);
    } catch (err) {
      setMessage("Failed to fetch applicants");
    }
  };

  useEffect(() => {
    fetchDrive();
    fetchApplicants();
  }, [id]);

  // 🔥 Update status
  const updateStatus = async (applicationId, status) => {
    try {
      await API.put(`/applications/${applicationId}/status`, { status });
      setMessage(`Status changed to ${status}`);
      fetchApplicants();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      {/* ================= DRIVE INFO ================= */}
      {drive && (
        <div
          style={{
            background: "#1e293b",
            color: "white",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "30px",
          }}
        >
          <h2>{drive.title}</h2>
          <p>{drive.companyName}</p>
          <p>{new Date(drive.date).toDateString()}</p>

          {drive.image && (
            <img
              src={drive.image}
              alt="drive"
              style={{
                width: "100%",
                maxHeight: "250px",
                objectFit: "cover",
                borderRadius: "10px",
                marginTop: "10px",
              }}
            />
          )}
        </div>
      )}

      {/* ================= HEADER ================= */}
      <h2>Applicants</h2>
      {message && <p style={{ color: "red" }}>{message}</p>}

      {/* ================= APPLICANTS ================= */}
      <div style={{ display: "grid", gap: "15px" }}>
        {applications.length === 0 && <p>No applicants yet</p>}

        {applications.map((app) => (
          <div
            key={app._id}
            style={{
              padding: "20px",
              borderRadius: "12px",
              background: "#f8fafc",
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            }}
          >
            <h3>{app.student?.name || "No Name"}</h3>

            <p><strong>Roll:</strong> {app.student?.rollNumber}</p>
            <p><strong>Email:</strong> {app.student?.email}</p>
            <p><strong>Branch:</strong> {app.student?.branch}</p>

            <p>
              <strong>Status:</strong>{" "}
              <span
                style={{
                  padding: "5px 10px",
                  borderRadius: "20px",
                  background:
                    app.status === "Selected"
                      ? "#16a34a"
                      : app.status === "Rejected"
                      ? "#dc2626"
                      : app.status === "Shortlisted"
                      ? "#f59e0b"
                      : "#64748b",
                  color: "white",
                }}
              >
                {app.status}
              </span>
            </p>

            {/* ================= BUTTONS ================= */}
            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button
                onClick={() => updateStatus(app._id, "Shortlisted")}
                style={{
                  padding: "8px 12px",
                  background: "#f59e0b",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                }}
              >
                Shortlist
              </button>

              <button
                onClick={() => updateStatus(app._id, "Selected")}
                style={{
                  padding: "8px 12px",
                  background: "#16a34a",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                }}
              >
                Select
              </button>

              <button
                onClick={() => updateStatus(app._id, "Rejected")}
                style={{
                  padding: "8px 12px",
                  background: "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                }}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}