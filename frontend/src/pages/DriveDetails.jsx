import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/api";

export default function DriveDetails() {
  const { id } = useParams();
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState("");

  const fetchApplicants = async () => {
    try {
      const res = await API.get(`/applications/drive/${id}`);
      setApplications(res.data);
    } catch (err) {
      setMessage("Failed to fetch applicants");
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [id]);

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
    <div className="content-stack">
      <div>
        <h2 className="page-title">Drive Applicants</h2>
        <p className="page-subtitle">
          Review and update the status of applicants for this drive.
        </p>
      </div>

      {message && <p className="message">{message}</p>}

      <div className="list">
        {applications.map((app) => (
          <div key={app._id} className="item">
            <p><strong>{app.student?.name || "No Name"}</strong></p>
            <p>Roll No: {app.student?.rollNumber}</p>
            <p>Email: {app.student?.email}</p>
            <p>Branch: {app.student?.branch}</p>
            <p>
              Current Status: <span className="status-pill">{app.status}</span>
            </p>

            <div className="toolbar" style={{ marginTop: "12px" }}>
              <button onClick={() => updateStatus(app._id, "Shortlisted")}>
                Shortlist
              </button>
              <button className="success" onClick={() => updateStatus(app._id, "Selected")}>
                Select
              </button>
              <button className="danger" onClick={() => updateStatus(app._id, "Rejected")}>
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}