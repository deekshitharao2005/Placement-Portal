import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role?.toLowerCase() !== "student") {
      navigate("/student/login");
      return;
    }

    fetchProfile();
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get("/student/me");

      const student = res.data || {};

      setForm({
        name: student.name || "",
        branch: student.branch || "",
        cgpa: student.cgpa ?? "",
        backlogs: student.backlogs ?? "",
        year: student.year ?? "",
        skills: Array.isArray(student.skills)
          ? student.skills.join(", ")
          : student.skills || "",
        workExperience: student.workExperience || "",
      });
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      setSaving(true);

      const payload = {
        ...form,
        cgpa: Number(form.cgpa),
        backlogs: Number(form.backlogs),
        year: Number(form.year),
        skills: form.skills,
      };

      await API.put("/student/profile", payload);
      setMessage("Profile updated successfully");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Loading profile...</p>;
  }

  return (
    <div>
      <h2>Student Profile</h2>
      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "12px", maxWidth: "500px" }}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
        />
        <input
          type="text"
          name="branch"
          placeholder="Branch"
          value={form.branch}
          onChange={handleChange}
        />
        <input
          type="number"
          step="0.01"
          name="cgpa"
          placeholder="CGPA"
          value={form.cgpa}
          onChange={handleChange}
        />
        <input
          type="number"
          name="backlogs"
          placeholder="Backlogs"
          value={form.backlogs}
          onChange={handleChange}
        />
        <input
          type="number"
          name="year"
          placeholder="Year"
          value={form.year}
          onChange={handleChange}
        />
        <input
          type="text"
          name="skills"
          placeholder="Skills"
          value={form.skills}
          onChange={handleChange}
        />
        <textarea
          name="workExperience"
          placeholder="Work Experience"
          value={form.workExperience}
          onChange={handleChange}
          rows="4"
        />
        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}