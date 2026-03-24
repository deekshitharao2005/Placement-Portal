import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="hero-wrap">
      <div className="card hero-card">
        <div className="hero-badge">Placement Ready Platform</div>

        <h1>Placement Management Portal</h1>

        <p>
          A smarter portal where students can complete profiles, check eligible
          drives, apply to opportunities, upload resumes, and track application
          progress through a clean and professional experience.
        </p>

        <div className="hero-actions">
          <Link to="/role" className="btn">
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}