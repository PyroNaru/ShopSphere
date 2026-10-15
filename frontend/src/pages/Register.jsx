import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

const FIELDS = [
  ["name", "Full name", "text", "name"],
  ["email", "Email", "email", "email"],
  ["password", "Password", "password", "new-password"],
  ["contact", "Contact number", "text", "tel"],
  ["address", "Delivery address", "text", "street-address"],
];

export default function Register() {
  const nav = useNavigate();
  const [f, setF] = useState({
    name: "",
    email: "",
    password: "",
    contact: "",
    address: "",
  });
  const [m, setM] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setM("");
    setBusy(true);
    try {
      await api.post("/register", f);
      nav("/login");
    } catch (x) {
      const errors = x.response?.data?.errors;
      setM(
        errors
          ? Object.values(errors).flat().join(" ")
          : x.response?.data?.message || "Registration failed.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="auth card">
      <h1>Create account</h1>
      <form onSubmit={submit}>
        {FIELDS.map(([k, l, t, ac]) => (
          <div className="field" key={k}>
            <label htmlFor={k}>{l}</label>
            <input
              id={k}
              type={t}
              autoComplete={ac}
              value={f[k]}
              onChange={(e) => setF({ ...f, [k]: e.target.value })}
              required
            />
          </div>
        ))}
        {m && <div className="alert">{m}</div>}
        <button className="btn full" disabled={busy}>
          {busy ? "Creating..." : "Register"}
        </button>
      </form>
      <p className="alt muted">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </section>
  );
}
