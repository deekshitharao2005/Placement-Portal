import { Link } from "react-router-dom";

export default function RoleSelect() {
  return (
    <div className="card center">
      <h2>Select Login Type</h2>
      <div className="row center">
        <Link to="/student/login" className="btn">
          Student Login
        </Link>
        <Link to="/admin/login" className="btn secondary">
          Admin Login
        </Link>
      </div>

      <p style={{ marginTop: "20px" }}>
        New student? <Link to="/student/signup">Create student account</Link>
      </p>
    </div>
  );
}