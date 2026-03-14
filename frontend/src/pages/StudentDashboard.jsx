import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState("");

  const loadData = async () => {
    try {
      const meRes = await api.get("/student/me");
      setStudent(meRes.data);

      const driveRes = await api.get("/student/eligible-drives");
      setDrives(driveRes.data);

      const appRes = await api.get("/applications/my");
      setApplications(appRes.data);
    } catch (error) {
      const msg = error.response?.data?.message || "Please login again";
      setMessage(msg);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.clear();
        navigate("/student/login");
      }
    }
  };

  useEffect(() => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");
    if (!token || role !== "student") {
      navigate("/student/login");
      return;
    }
    loadData();
  }, [navigate]);

  const applyToDrive = async (driveId) => {
    try {
      await api.post("/applications/apply", { driveId });
      setMessage("Applied successfully");
      loadData();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not apply");
    }
  };

  const appliedDriveIds = applications.map((app) => app.drive?._id);

  return (
    <div>
      <div className="card">
        <h2>Student Dashboard</h2>
        {student && (
          <div className="grid-2">
            <p><strong>Name:</strong> {student.name}</p>
            <p><strong>Roll Number:</strong> {student.rollNumber}</p>
            <p><strong>Branch:</strong> {student.branch}</p>
            <p><strong>CGPA:</strong> {student.cgpa}</p>
            <p><strong>Backlogs:</strong> {student.backlogs}</p>
            <p><strong>Year:</strong> {student.year}</p>
            <p><strong>Skills:</strong> {student.skills?.join(", ")}</p>
            <p><strong>Work Experience:</strong> {student.workExperience}</p>
          </div>
        )}
        {message && <p className="message">{message}</p>}
      </div>

      <div className="card">
        <h3>Eligible Drives</h3>
        {drives.length === 0 ? (
          <p>No eligible drives available right now.</p>
        ) : (
          <div className="list">
            {drives.map((drive) => (
              <div className="item" key={drive._id}>
                <h4>{drive.companyName}</h4>
                <p><strong>Role:</strong> {drive.role}</p>
                <p><strong>Package:</strong> {drive.package}</p>
                <p><strong>Min CGPA:</strong> {drive.minCGPA}</p>
                <p><strong>Allowed Branches:</strong> {drive.allowedBranches.join(", ")}</p>
                <p><strong>Max Backlogs:</strong> {drive.maxBacklogs}</p>
                <p><strong>Required Skills:</strong> {drive.requiredSkills.join(", ")}</p>

                {appliedDriveIds.includes(drive._id) ? (
                  <button className="btn disabled" disabled>
                    Already Applied
                  </button>
                ) : (
                  <button className="btn" onClick={() => applyToDrive(drive._id)}>
                    Apply
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3>My Applications</h3>
        {applications.length === 0 ? (
          <p>You have not applied to any drives yet.</p>
        ) : (
          <div className="list">
            {applications.map((app) => (
              <div className="item" key={app._id}>
                <h4>{app.drive?.companyName}</h4>
                <p><strong>Role:</strong> {app.drive?.role}</p>
                <p><strong>Package:</strong> {app.drive?.package}</p>
                <p><strong>Status:</strong> {app.status}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}