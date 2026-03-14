import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import RoleSelect from "./pages/RoleSelect";
import StudentSignup from "./pages/StudentSignup";
import StudentLogin from "./pages/StudentLogin";
import StudentProfile from "./pages/StudentProfile";
import StudentDashboard from "./pages/StudentDashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

function NavBar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        Placement Portal
      </Link>

      <div className="nav-links">
        <Link to="/role">Login</Link>
        {role === "student" && <Link to="/student/dashboard">Student Dashboard</Link>}
        {role === "admin" && <Link to="/admin/dashboard">Admin Dashboard</Link>}
        {role && (
          <button className="small-btn danger" onClick={logout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <>
      <NavBar />
      <div className="page-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/role" element={<RoleSelect />} />
          <Route path="/student/signup" element={<StudentSignup />} />
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </div>
    </>
  );
}