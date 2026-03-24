import { useEffect, useState } from "react";
import API from "../api/api";

export default function StudentDrives() {
  const [drives, setDrives] = useState([]);
  const [message, setMessage] = useState("");

  const fetchDrives = async () => {
    try {
      const res = await API.get("/student/eligible-drives");
      setDrives(res.data);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to fetch eligible drives");
    }
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  const applyToDrive = async (driveId) => {
    try {
      const res = await API.post("/applications", { driveId });
      setMessage(res.data.message);
      fetchDrives();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to apply");
    }
  };

  return (
    <div className="page-container content-stack">
      <div>
        <h2 className="page-title">Eligible Drives</h2>
        <p className="page-subtitle">
          View all opportunities that match your current profile.
        </p>
      </div>

      {message && <p className="message">{message}</p>}

      {drives.length === 0 ? (
        <div className="card">
          <p className="muted">No eligible drives available.</p>
        </div>
      ) : (
        <div className="list">
          {drives.map((d) => (
            <div key={d._id} className="item">
              <h3>{d.companyName}</h3>
              <p>Role: {d.role}</p>
              <p>Package: {d.package}</p>
              <p>Description: {d.description || "No description provided"}</p>
              <p>Min CGPA: {d.minCGPA}</p>
              <p>Max Backlogs: {d.maxBacklogs}</p>
              <p>
                Allowed Branches: {d.allowedBranches?.length ? d.allowedBranches.join(", ") : "All"}
              </p>
              <p>
                Required Skills: {d.requiredSkills?.length ? d.requiredSkills.join(", ") : "None"}
              </p>

              <button onClick={() => applyToDrive(d._id)} disabled={d.hasApplied}>
                {d.hasApplied ? "Already Applied" : "Apply"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}