import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

export default function Drives() {
  const [drives, setDrives] = useState([]);
  const [form, setForm] = useState({
    title: "",
    companyName: "",
    image: "",
    date: "",
    role: "",
    package: "",
    requiredSkills: "",
    description: "",
    applicationLink: "",
    minCGPA: "",
    allowedBranches: "",
    maxBacklogs: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const fetchDrives = async () => {
    try {
      const res = await API.get("/drives");
      setDrives(res.data);
    } catch {
      setMessage("Failed to fetch drives");
    }
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const createDrive = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await API.post("/drives", form);
      setForm({
        title: "",
        companyName: "",
        image: "",
        date: "",
        role: "",
        package: "",
        requiredSkills: "",
        description: "",
        applicationLink: "",
        minCGPA: "",
        allowedBranches: "",
        maxBacklogs: "",
      });
      setMessage("Drive created successfully");
      fetchDrives();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to create drive");
    }
  };

  const deleteDrive = async (id) => {
    try {
      await API.delete(`/drives/${id}`);
      setMessage("Drive deleted successfully");
      fetchDrives();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to delete drive");
    }
  };

  return (
    <div className="content-stack">
      <div>
        <h2 className="page-title">Drives</h2>
        <p className="page-subtitle">
          Create, manage, and review active placement drives.
        </p>
      </div>

      {message && <p className="message">{message}</p>}

      <div className="card">
        <h3>Create Drive</h3>

        <form onSubmit={createDrive} className="form">
          <input
            name="title"
            placeholder="Drive title"
            value={form.title}
            onChange={handleChange}
            required
          />

          <input
            name="companyName"
            placeholder="Company name"
            value={form.companyName}
            onChange={handleChange}
            required
          />

          <input
            name="image"
            placeholder="Company logo / image URL"
            value={form.image}
            onChange={handleChange}
          />

          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
          />

          <input
            name="role"
            placeholder="Role"
            value={form.role}
            onChange={handleChange}
            required
          />

          <input
            name="package"
            placeholder="Package"
            value={form.package}
            onChange={handleChange}
            required
          />

          <input
            name="requiredSkills"
            placeholder="Skills required comma separated"
            value={form.requiredSkills}
            onChange={handleChange}
          />

          <textarea
            name="description"
            placeholder="Job description"
            value={form.description}
            onChange={handleChange}
          />

          <input
            name="applicationLink"
            placeholder="External application link"
            value={form.applicationLink}
            onChange={handleChange}
          />

          <input
            name="minCGPA"
            placeholder="Minimum CGPA"
            value={form.minCGPA}
            onChange={handleChange}
          />

          <input
            name="allowedBranches"
            placeholder="Allowed branches comma separated"
            value={form.allowedBranches}
            onChange={handleChange}
          />

          <input
            name="maxBacklogs"
            placeholder="Max backlogs"
            value={form.maxBacklogs}
            onChange={handleChange}
          />

          <button type="submit">Create Drive</button>
        </form>
      </div>

      <div className="list">
        {drives.map((d) => (
          <div key={d._id} className="item">
            {d.image && (
              <img
                src={d.image}
                alt={d.companyName}
                style={{
                  width: "70px",
                  height: "70px",
                  objectFit: "contain",
                  borderRadius: "10px",
                  marginBottom: "10px",
                  background: "#fff",
                  padding: "6px",
                }}
              />
            )}

            <p><strong>{d.title}</strong></p>
            <p>Company: {d.companyName}</p>
            <p>Date: {d.date ? new Date(d.date).toDateString() : "N/A"}</p>
            <p>Role: {d.role}</p>
            <p>Package: {d.package}</p>
            {d.applicationLink && <p>Application Link: {d.applicationLink}</p>}

            <div className="toolbar" style={{ marginTop: "10px" }}>
              <button onClick={() => navigate(`/admin/drives/${d._id}`)}>
                View Applicants
              </button>
              <button className="danger" onClick={() => deleteDrive(d._id)}>
                Delete Drive
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}