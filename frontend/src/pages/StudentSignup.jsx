import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

export default function StudentSignup() {
  const [form, setForm] = useState({
    rollNumber: "",
    password: "",
    email: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage("");

  try {
    const payload = {
      rollNumber: form.rollNumber,
      password: form.password,
    };

    if (form.email.trim()) {
      payload.email = form.email.trim();
    }

    const res = await API.post("/student/signup", payload);
    setMessage(res.data.message);

    if (res.data.emailRequiredForVerification) {
      navigate("/student/verify-otp", {
        state: { rollNumber: form.rollNumber },
      });
    } else {
      navigate("/student/login");
    }
  } catch (err) {
    setMessage(err.response?.data?.message || "Signup failed");
  }
};

  return (
    <div className="card">
      <h2>Student Signup</h2>
      <form onSubmit={handleSubmit} className="form">
        <input
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
       <input
  type="email"
  name="email"
  placeholder="Email (optional)"
  value={form.email}
  onChange={handleChange}
/>
        <button type="submit" className="btn">Signup</button>
      </form>

      {message && <p className="message">{message}</p>}
    </div>
  );
}