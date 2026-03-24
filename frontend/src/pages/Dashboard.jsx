export default function Dashboard() {
  return (
    <div className="content-stack">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Quick overview of the placement management system.
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-box">
          <p className="stat-label">Total Students</p>
          <p className="stat-value">120</p>
        </div>

        <div className="stat-box">
          <p className="stat-label">Placed</p>
          <p className="stat-value">80</p>
        </div>

        <div className="stat-box">
          <p className="stat-label">Companies</p>
          <p className="stat-value">25</p>
        </div>

        <div className="stat-box">
          <p className="stat-label">Active Drives</p>
          <p className="stat-value">5</p>
        </div>
      </div>
    </div>
  );
}