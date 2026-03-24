import { Link } from "react-router-dom";
import logo from "../assets/vnrvjiet-logo.png";

export default function Home() {
  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      
      <img
        src={logo}
        alt="VNRVJIET Logo"
        style={{ width: "120px", marginBottom: "20px" }}
      />

      <h1>Placement Portal</h1>
      <p>Welcome to VNRVJIET Placement Portal</p>

    </div>
  );
}
<img
  src={logo}
  alt="Logo"
  style={{
    width: "120px",
    borderRadius: "50%",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
    marginBottom: "20px"
  }}
/>