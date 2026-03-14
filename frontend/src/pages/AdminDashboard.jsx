import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [driveForm, setDriveForm] = useState({
    companyName: "",
    role: "",
    package: "",
    description: "",
    minCGPA: "",
    allowedBranches: "",
    maxBacklogs: "",
    requiredSkills: "",
  });

  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [message, setMessage] = useState("");

  const loadData = async () => {
    try {
      const [drivesRes, appsRes, statsRes] = await Promise.all([
        api.get("/drives"),
        api.get("/applications"),
        api.get("/admin/stats"),
      ]);

      setDrives(drivesRes.data);
      setApplications(appsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      const msg = error.response?.data?.message || "Please login again";
      setMessage(msg);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.clear();
        navigate("/admin/login");
      }
    }
  };

  useEffect(() => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");
    if (!token || role !== "admin") {
      navigate("/admin/login");
      return;
    }
    loadData();
  }, [navigate]);

  const handleChange = (e) =>
    setDriveForm({ ...driveForm, [e.target.name]: e.target.value });

  const createDrive = async (e) => {
    e.preventDefault();
    try {
      await api.post("/drives", driveForm);
      setMessage("Drive created successfully");
      setDriveForm({
        companyName: "",
        role: "",
        package: "",
        description: "",
        minCGPA: "",
        allowedBranches: "",
        maxBacklogs: "",
        requiredSkills: "",
      });
      loadData();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not create drive");
    }
  };

  const deleteDrive = async (id) => {
    try {
      await api.delete(`/drives/${id}`);
      setMessage("Drive deleted successfully");
      loadData();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not delete drive");
    }
  };

  const updateStatus = async (applicationId, status) => {
    try {
      await api.put(`/applications/${applicationId}/status`, { status });
      setMessage("Application status updated");
      loadData();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not update status");
    }
  };

  return (
    <div>
      <div className="card">
        <h2>Admin Dashboard</h2>
        {message && <p className="message">{message}</p>}
      </div>

      <div className="card">
        <h3>Create Drive</h3>
        <form onSubmit={createDrive} className="form">
          <input name="companyName" placeholder="Company Name" value={driveForm.companyName} onChange={handleChange} required />
          <input name="role" placeholder="Job Role" value={driveForm.role} onChange={handleChange} required />
          <input name="package" placeholder="Package (example: 6 LPA)" value={driveForm.package} onChange={handleChange} required />
          <textarea name="description" placeholder="Description" value={driveForm.description} onChange={handleChange} />
          <input name="minCGPA" type="number" step="0.01" placeholder="Minimum CGPA" value={driveForm.minCGPA} onChange={handleChange} required />
          <input name="allowedBranches" placeholder="Allowed Branches (CSE, IT, ECE)" value={driveForm.allowedBranches} onChange={handleChange} required />
          <input name="maxBacklogs" type="number" placeholder="Max Backlogs" value={driveForm.maxBacklogs} onChange={handleChange} required />
          <input name="requiredSkills" placeholder="Required Skills (Java, Python)" value={driveForm.requiredSkills} onChange={handleChange} />
          <button type="submit" className="btn">Create Drive</button>
        </form>
      </div>

      <div className="card">
        <h3>All Drives</h3>
        {drives.length === 0 ? (
          <p>No drives created yet.</p>
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
                <button className="small-btn danger" onClick={() => deleteDrive(drive._id)}>
                  Delete Drive
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3>Manage Applications</h3>
        {applications.length === 0 ? (
          <p>No applications found.</p>
        ) : (
          <div className="list">
            {applications.map((app) => (
              <div className="item" key={app._id}>
                <h4>{app.student?.name} ({app.student?.rollNumber})</h4>
                <p><strong>Branch:</strong> {app.student?.branch}</p>
                <p><strong>Company:</strong> {app.drive?.companyName}</p>
                <p><strong>Role:</strong> {app.drive?.role}</p>
                <p><strong>Status:</strong> {app.status}</p>

                <div className="row wrap">
                  <button className="small-btn" onClick={() => updateStatus(app._id, "Applied")}>Applied</button>
                  <button className="small-btn" onClick={() => updateStatus(app._id, "Shortlisted")}>Shortlisted</button>
                  <button className="small-btn success" onClick={() => updateStatus(app._id, "Selected")}>Selected</button>
                  <button className="small-btn danger" onClick={() => updateStatus(app._id, "Rejected")}>Rejected</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3>Statistics</h3>
        {!stats ? (
          <p>Loading stats...</p>
        ) : (
          <>
            <div className="grid-4">
              <div className="stat-box">
                <h4>Total Applications</h4>
                <p>{stats.totalApplications}</p>
              </div>
              <div className="stat-box">
                <h4>Shortlisted</h4>
                <p>{stats.shortlistedCount}</p>
              </div>
              <div className="stat-box">
                <h4>Selected</h4>
                <p>{stats.selectedCount}</p>
              </div>
              <div className="stat-box">
                <h4>Rejected</h4>
                <p>{stats.rejectedCount}</p>
              </div>
            </div>

            <h4 style={{ marginTop: "20px" }}>Applications by Branch</h4>
            {stats.appliedByBranch.length === 0 ? (
              <p>No branch-wise data yet.</p>
            ) : (
              <div className="list">
                {stats.appliedByBranch.map((item) => (
                  <div className="item" key={item._id}>
                    <p>
                      <strong>{item._id || "Unknown Branch"}:</strong> {item.count}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}