import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="card center">
      <h1>Placement Management Portal</h1>
      <p>
        A portal where students can complete their profile, view eligible drives,
        apply for jobs, and track application status.
      </p>
      <Link to="/role" className="btn">
        Get Started
      </Link>
    </div>
  );
}