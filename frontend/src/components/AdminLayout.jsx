import { Link, Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <h2>Admin Panel</h2>

        <nav className="admin-nav">
          <Link to="/admin/dashboard">Dashboard</Link>
          <Link to="/admin/students">Students</Link>
          <Link to="/admin/companies">Companies</Link>
          <Link to="/admin/drives">Drives</Link>
          <Link to="/admin/reports">Reports</Link>
        </nav>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}