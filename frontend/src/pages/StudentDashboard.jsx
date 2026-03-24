import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

export default function StudentDashboard() {
  const [applications, setApplications] = useState([]);
  const [eligibleDrives, setEligibleDrives] = useState([]);
  const [student, setStudent] = useState(null);
  const [message, setMessage] = useState("");
  const [resumeFiles, setResumeFiles] = useState({});
  const navigate = useNavigate();

  const API_BASE =
    import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

  const fetchStudent = async () => {
    try {
      const res = await API.get("/student/me");
      setStudent(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await API.get("/applications/my");
      setApplications(res.data);
    } catch (err) {
      setMessage("Failed to fetch applications");
    }
  };

  const fetchEligibleDrives = async () => {
    try {
      const res = await API.get("/student/eligible-drives");
      setEligibleDrives(res.data);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to fetch eligible drives");
    }
  };

  useEffect(() => {
    fetchStudent();
    fetchApplications();
    fetchEligibleDrives();
  }, []);

  const handleResumeChange = (driveId, file) => {
    setResumeFiles((prev) => ({
      ...prev,
      [driveId]: file || null,
    }));
  };

  const applyToDrive = async (driveId) => {
    try {
      const formData = new FormData();
      formData.append("driveId", driveId);

      if (resumeFiles[driveId]) {
        formData.append("resume", resumeFiles[driveId]);
      }

      const res = await API.post("/applications", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage(res.data.message);

      setResumeFiles((prev) => ({
        ...prev,
        [driveId]: null,
      }));

      fetchApplications();
      fetchEligibleDrives();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to apply");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Student Dashboard</h2>

      {student && (
        <div
          style={{
            border: "1px solid #ddd",
            padding: "16px",
            marginBottom: "20px",
            borderRadius: "8px",
          }}
        >
          <h3>Welcome, {student.name || student.rollNumber}</h3>
          <p>Roll Number: {student.rollNumber}</p>
          <p>Email: {student.email || "Not added"}</p>
          <p>Branch: {student.branch || "Not updated"}</p>
          <p>Placement Status: {student.placementStatus || "Not Placed"}</p>

          <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
            <button onClick={() => navigate("/student/profile")}>
              Edit Profile
            </button>
            <button onClick={() => navigate("/student/drives")}>
              View All Eligible Drives
            </button>
          </div>
        </div>
      )}

      {message && <p>{message}</p>}

      <div style={{ marginBottom: "28px" }}>
        <h3>Eligible Drives</h3>
        {eligibleDrives.length === 0 ? (
          <p>No eligible drives available.</p>
        ) : (
          eligibleDrives.map((drive) => (
            <div
              key={drive._id}
              style={{
                border: "1px solid #ddd",
                padding: "12px",
                marginBottom: "12px",
                borderRadius: "8px",
              }}
            >
              <p><strong>{drive.companyName}</strong></p>
              <p>Role: {drive.role}</p>
              <p>Package: {drive.package}</p>
              <p>Description: {drive.description || "No description provided"}</p>

              <div style={{ marginTop: "10px", marginBottom: "10px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "500",
                  }}
                >
                  Upload CV (optional, PDF only)
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) =>
                    handleResumeChange(drive._id, e.target.files?.[0] || null)
                  }
                  disabled={drive.hasApplied}
                />
                {resumeFiles[drive._id] && !drive.hasApplied && (
                  <p style={{ marginTop: "6px", fontSize: "14px" }}>
                    Selected: {resumeFiles[drive._id].name}
                  </p>
                )}
              </div>

              <button
                onClick={() => applyToDrive(drive._id)}
                disabled={drive.hasApplied}
              >
                {drive.hasApplied ? "Already Applied" : "Apply"}
              </button>
            </div>
          ))
        )}
      </div>

      <div>
        <h3>My Applications</h3>
        {applications.length === 0 ? (
          <p>No applications yet.</p>
        ) : (
          applications.map((app) => (
            <div
              key={app._id}
              style={{
                border: "1px solid #ddd",
                padding: "12px",
                marginBottom: "12px",
                borderRadius: "8px",
              }}
            >
              <p><strong>{app.drive?.companyName}</strong></p>
              <p>Role: {app.drive?.role}</p>
              <p>Package: {app.drive?.package}</p>
              <p>Status: {app.status}</p>

              {app.resumeUrl ? (
                <p>
                  Resume:{" "}
                  <a
                    href={`${API_BASE}${app.resumeUrl}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {app.resumeOriginalName || "View Uploaded Resume"}
                  </a>
                </p>
              ) : (
                <p>Resume: Not uploaded</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}