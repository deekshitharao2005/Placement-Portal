import { useEffect, useState } from "react";
import API from "../api/api";

export default function Companies() {
  const [companies, setCompanies] = useState([]);

  const fetchCompanies = async () => {
    const res = await API.get("/admin-management/companies");
    setCompanies(res.data);
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return (
    <div className="content-stack">
      <div>
        <h2 className="page-title">Companies</h2>
        <p className="page-subtitle">
          Browse the companies and roles currently available in the portal.
        </p>
      </div>

      <div className="list">
        {companies.map((c) => (
          <div key={c._id} className="item">
            <p><strong>{c.companyName}</strong></p>
            <p>Role: {c.role}</p>
            <p>Package: {c.package}</p>
            <p>
              Skills Required:{" "}
              {Array.isArray(c.requiredSkills) ? c.requiredSkills.join(", ") : ""}
            </p>
            <p>Description: {c.description || "No description"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}