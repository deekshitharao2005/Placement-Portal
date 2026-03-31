import { useState } from "react";
import API from "../api/api";

const branches = ["AIDS", "DS-A", "DS-B", "CYS"];

export default function StudentReport() {
  const [selectedBranch, setSelectedBranch] = useState("");
  const [data, setData] = useState([]);
  const [message, setMessage] = useState("");

  const fetchBranchData = async (branch) => {
    try {
      setSelectedBranch(branch);
      setMessage("");
      const res = await API.get(`/report/${branch}`);
      setData(res.data);
    } catch (error) {
      setMessage("Failed to load branch report");
      setData([]);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <h2 style={styles.title}>Student Report</h2>
        <p style={styles.subtitle}>
          Select a branch to view roll numbers, names, company, and salary.
        </p>
      </div>

      <div style={styles.branchRow}>
        {branches.map((branch) => (
          <button
            key={branch}
            onClick={() => fetchBranchData(branch)}
            style={{
              ...styles.branchButton,
              ...(selectedBranch === branch ? styles.branchActive : {}),
            }}
          >
            {branch}
          </button>
        ))}
      </div>

      {message && <p style={styles.error}>{message}</p>}

      {selectedBranch && (
        <div style={styles.tableCard}>
          <h3 style={styles.tableTitle}>{selectedBranch} Placement Details</h3>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Roll Number</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Company</th>
                  <th style={styles.th}>Salary</th>
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? (
                  data.map((student, index) => (
                    <tr key={index}>
                      <td style={styles.td}>{student.roll}</td>
                      <td style={styles.td}>{student.name}</td>
                      <td style={styles.td}>{student.company}</td>
                      <td style={styles.td}>{student.salary}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td style={styles.td} colSpan="4">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    width: "100%",
  },
  header: {
    marginBottom: "20px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "8px",
    color: "#0f172a",
  },
  subtitle: {
    color: "#475569",
    fontSize: "15px",
  },
  branchRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "24px",
  },
  branchButton: {
    padding: "10px 18px",
    border: "none",
    borderRadius: "10px",
    background: "#e2e8f0",
    color: "#0f172a",
    fontWeight: "600",
    cursor: "pointer",
  },
  branchActive: {
    background: "#2563eb",
    color: "#fff",
  },
  tableCard: {
    background: "#fff",
    padding: "20px",
    borderRadius: "14px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
  },
  tableTitle: {
    marginBottom: "16px",
    color: "#0f172a",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "12px",
    background: "#0f172a",
    color: "#fff",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #e2e8f0",
  },
  error: {
    color: "red",
    marginBottom: "12px",
  },
};