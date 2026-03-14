import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function StudentProfile() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    branch: "",
    cgpa: "",
    backlogs: "",
    year: "",
    skills: "",
    workExperience: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");
    if (!token || role !== "student") {
      navigate("/student/login");
    }
  }, [navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await api.put("/student/profile", form);
      setMessage(res.data.message);
      setTimeout(() => navigate("/student/dashboard"), 1000);
    } catch (error) {
      setMessage(error.response?.data?.message || "Profile update failed");
    }
  };

  return (
    <div className="card">
      <h2>Complete Student Profile</h2>
      <form onSubmit={handleSubmit} className="form">
        <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required />
        <input name="branch" placeholder="Branch (example: CSE)" value={form.branch} onChange={handleChange} required />
        <input name="cgpa" type="number" step="0.01" placeholder="CGPA" value={form.cgpa} onChange={handleChange} required />
        <input name="backlogs" type="number" placeholder="Number of Backlogs" value={form.backlogs} onChange={handleChange} required />
        <input name="year" type="number" placeholder="Year of Study" value={form.year} onChange={handleChange} required />
        <input
          name="skills"
          placeholder="Skills separated by commas (Java, Python, React)"
          value={form.skills}
          onChange={handleChange}
          required
        />
        <input
          name="workExperience"
          placeholder="Work Experience (Fresher / Internship / etc.)"
          value={form.workExperience}
          onChange={handleChange}
        />
        <button type="submit" className="btn">
          Save Profile
        </button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
}