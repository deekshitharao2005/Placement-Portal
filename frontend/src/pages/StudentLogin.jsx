import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function StudentLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    rollNumber: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await api.post("/student/login", form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      if (res.data.student.profileCompleted) {
        navigate("/student/dashboard");
      } else {
        navigate("/student/profile");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="card">
      <h2>Student Login</h2>
      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          name="rollNumber"
          placeholder="Roll Number"
          value={form.rollNumber}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit" className="btn">
          Login
        </button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
}