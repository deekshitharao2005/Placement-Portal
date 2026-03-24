import { useEffect, useState } from "react";
import API from "../api/api";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    rollNumber: "",
    password: "",
    name: "",
    branch: "",
    cgpa: "",
    backlogs: "",
    year: "",
    skills: "",
    workExperience: "",
  });

  const API_BASE =
    import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

  const fetchStudents = async () => {
    try {
      const res = await API.get("/admin-management/students-with-applications");
      setStudents(res.data);
    } catch (err) {
      setMessage("Failed to fetch students");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addStudent = async (e) => {
    e.preventDefault();
    try {
      await API.post("/admin-management/students", form);
      setForm({
        rollNumber: "",
        password: "",
        name: "",
        branch: "",
        cgpa: "",
        backlogs: "",
        year: "",
        skills: "",
        workExperience: "",
      });
      setMessage("Student added successfully");
      fetchStudents();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to add student");
    }
  };

  const deleteStudent = async (id) => {
    try {
      await API.delete(`/admin-management/students/${id}`);
      setMessage("Student deleted successfully");
      fetchStudents();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to delete student");
    }
  };

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      await API.put(`/applications/${applicationId}/status`, { status });
      setMessage(`Application marked as ${status}`);
      fetchStudents();
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Failed to update application status"
      );
    }
  };

  const statusButtonStyle = (currentStatus, buttonStatus) => ({
    padding: "8px 12px",
    borderRadius: "10px",
    border: "1px solid rgba(148,163,184,0.25)",
    cursor: "pointer",
    background: currentStatus === buttonStatus ? "#dbeafe" : "#ffffff",
    color: currentStatus === buttonStatus ? "#1d4ed8" : "#0f172a",
    fontWeight: currentStatus === buttonStatus ? "700" : "600",
    boxShadow: "0 6px 14px rgba(15,23,42,0.05)",
  });

  return (
    <div className="content-stack">
      <div>
        <h2 className="page-title">Students</h2>
        <p className="page-subtitle">
          Add students, review details, and manage application statuses.
        </p>
      </div>

      {message && <p className="message">{message}</p>}

      <div className="card">
        <h3>Add Student</h3>
        <form onSubmit={addStudent} className="form">
          <input
            name="rollNumber"
            placeholder="Roll Number"
            value={form.rollNumber}
            onChange={handleChange}
            required
          />
          <input
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
          />
          <input
            name="branch"
            placeholder="Department / Branch"
            value={form.branch}
            onChange={handleChange}
          />
          <input
            name="cgpa"
            placeholder="CGPA"
            value={form.cgpa}
            onChange={handleChange}
          />
          <input
            name="backlogs"
            placeholder="Backlogs"
            value={form.backlogs}
            onChange={handleChange}
          />
          <input
            name="year"
            placeholder="Year"
            value={form.year}
            onChange={handleChange}
          />
          <input
            name="skills"
            placeholder="Skills comma separated"
            value={form.skills}
            onChange={handleChange}
          />
          <input
            name="workExperience"
            placeholder="Work Experience"
            value={form.workExperience}
            onChange={handleChange}
          />
          <button type="submit">Add Student</button>
        </form>
      </div>

      <div className="list">
        {students.map((s) => (
          <div key={s._id} className="item">
            <p><strong>{s.name || "No Name"}</strong></p>
            <p>Roll No: {s.rollNumber}</p>
            <p>Department: {s.branch}</p>
            <p>CGPA: {s.cgpa}</p>
            <p>Skills: {Array.isArray(s.skills) ? s.skills.join(", ") : ""}</p>
            <p>Status: <span className="status-pill">{s.placementStatus}</span></p>

            <button
              className="danger"
              onClick={() => deleteStudent(s._id)}
              style={{ marginBottom: "14px" }}
            >
              Delete
            </button>

            <div>
              <h4>Applications</h4>

              {!s.applications || s.applications.length === 0 ? (
                <p>No applications yet.</p>
              ) : (
                <div className="list">
                  {s.applications.map((app) => (
                    <div
                      key={app._id}
                      style={{
                        border: "1px solid rgba(148,163,184,0.2)",
                        padding: "14px",
                        marginBottom: "10px",
                        borderRadius: "14px",
                        background: "#fcfdff",
                      }}
                    >
                      <p><strong>{app.drive?.companyName || "Unknown Company"}</strong></p>
                      <p>Role: {app.drive?.role || "N/A"}</p>
                      <p>Package: {app.drive?.package || "N/A"}</p>
                      <p>
                        Application Status: <strong>{app.status}</strong>
                      </p>

                      {app.resumeUrl ? (
                        <div style={{ marginTop: "8px" }}>
                          <strong>Resume:</strong>{" "}
                          <a
                            className="link-inline"
                            href={`${API_BASE}${app.resumeUrl}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {app.resumeOriginalName || "View PDF"}
                          </a>
                        </div>
                      ) : (
                        <div style={{ marginTop: "8px" }}>
                          <strong>Resume:</strong> Not uploaded
                        </div>
                      )}

                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          marginTop: "12px",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          onClick={() => updateApplicationStatus(app._id, "Shortlisted")}
                          style={statusButtonStyle(app.status, "Shortlisted")}
                        >
                          Shortlisted
                        </button>

                        <button
                          onClick={() => updateApplicationStatus(app._id, "Selected")}
                          style={statusButtonStyle(app.status, "Selected")}
                        >
                          Selected
                        </button>

                        <button
                          onClick={() => updateApplicationStatus(app._id, "Rejected")}
                          style={statusButtonStyle(app.status, "Rejected")}
                        >
                          Rejected
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}