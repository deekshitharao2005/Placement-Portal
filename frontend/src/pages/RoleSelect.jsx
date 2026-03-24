import { Link } from "react-router-dom";

export default function RoleSelect() {
  return (
    <div className="page-container">
      <div className="card center">
        <h2 className="page-title">Select Login Type</h2>
        <p className="page-subtitle">
          Choose how you want to enter the placement portal.
        </p>

        <div className="row wrap" style={{ justifyContent: "center" }}>
          <Link to="/student/login" className="btn">
            Student Login
          </Link>
          <Link to="/admin/login" className="btn secondary">
            Admin Login
          </Link>
        </div>

        <p style={{ marginTop: "22px" }}>
          New student?{" "}
          <Link to="/student/signup" className="link-inline">
            Create student account
          </Link>
        </p>
      </div>
    </div>
  );
}