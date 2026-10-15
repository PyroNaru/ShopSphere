import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

export default function Login() {
  const nav = useNavigate();
  const [e, setE] = useState("");
  const [p, setP] = useState("");
  const [m, setM] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (x) => {
    x.preventDefault();
    setM("");
    setBusy(true);
    try {
      const r = await api.post("/login", { email: e, password: p });
      localStorage.setItem("token", r.data.token);
      nav("/dashboard");
    } catch (x) {
      const errors = x.response?.data?.errors;
      setM(
        errors
          ? Object.values(errors).flat().join(" ")
          : x.response?.data?.message || "Login failed.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="auth card">
      <h1>Welcome back</h1>
      <form onSubmit={submit}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={e}
            onChange={(x) => setE(x.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="pw">Password</label>
          <input
            id="pw"
            type="password"
            value={p}
            onChange={(x) => setP(x.target.value)}
            required
          />
        </div>
        {m && <div className="alert">{m}</div>}
        <button className="btn full" disabled={busy}>
          {busy ? "Logging in..." : "Login"}
        </button>
      </form>
      <p className="alt muted">
        New here? <Link to="/register">Create an account</Link>
      </p>
    </section>
  );
}
