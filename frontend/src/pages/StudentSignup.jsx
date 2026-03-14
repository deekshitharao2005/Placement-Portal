import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function StudentSignup() {
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
      const res = await api.post("/student/signup", form);
      setMessage(res.data.message);
      setTimeout(() => navigate("/student/login"), 1000);
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="card">
      <h2>Student Signup</h2>
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
          Create Account
        </button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
}