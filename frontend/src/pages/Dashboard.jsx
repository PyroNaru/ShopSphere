import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

export default function Dashboard() {
  const nav = useNavigate();
  const [u, setU] = useState(null);
  const [m, setM] = useState("");

  useEffect(() => {
    api
      .get("/me")
      .then((r) => setU(r.data))
      .catch(() => setM("Your session expired. Please login again."));
  }, []);

  const out = async () => {
    try {
      await api.post("/logout");
    } finally {
      localStorage.removeItem("token");
      nav("/login");
    }
  };

  if (m)
    return (
      <div className="alert">
        {m} <Link to="/login">Login</Link>
      </div>
    );
  if (!u) return <p className="muted">Loading...</p>;
  return (
    <section>
      <h1>My account</h1>
      <div className="card row">
        <div className="row" style={{ justifyContent: "flex-start", gap: 16 }}>
          <div className="avatar">{u.name?.[0]?.toUpperCase()}</div>
          <div>
            <h2 style={{ margin: 0 }}>Hi, {u.name}!</h2>
            <div className="muted">{u.email}</div>
          </div>
        </div>
        <button className="btn ghost" onClick={out}>
          Logout
        </button>
      </div>
      <div className="card">
        <h3>Contact details</h3>
        <p>
          <strong>Contact:</strong> {u.contact}
        </p>
        <p>
          <strong>Address:</strong> {u.address}
        </p>
        <Link to="/orders" className="btn">
          View my orders
        </Link>
      </div>
    </section>
  );
}
