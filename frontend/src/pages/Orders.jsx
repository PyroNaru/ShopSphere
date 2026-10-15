import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

const LABELS = { pending: "Awaiting payment", paid: "Paid", failed: "Failed" };
const TABS = [
  ["all", "All"],
  ["paid", "Paid"],
  ["pending", "Unpaid"],
];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [m, setM] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    api
      .get("/orders")
      .then((r) => setOrders(r.data))
      .catch(() => setM("Unable to load your orders."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="muted">Loading orders...</p>;
  if (m) return <div className="alert">{m}</div>;
  const shown = orders.filter((o) => tab === "all" || o.status === tab);

  return (
    <section>
      <h1>Your orders</h1>
      <div className="chips" style={{ marginBottom: 16 }}>
        {TABS.map(([k, l]) => (
          <button
            key={k}
            className={`chip ${tab === k ? "on" : ""}`}
            onClick={() => setTab(k)}
          >
            {l}
          </button>
        ))}
      </div>
      {shown.length === 0 && (
        <div className="empty card">
          <span>📦</span>No orders here yet. <br />
          <Link to="/products">Start shopping</Link>
        </div>
      )}
      {shown.map((o) => (
        <Link to={`/orders/${o.id}`} key={o.id} className="order">
          <div className="card row">
            <div>
              <strong>Order #{o.id}</strong>
              <div>
                ₱{Number(o.amount).toFixed(2)} · {o.items.length} item(s)
              </div>
              <div className="muted">
                {new Date(o.created_at).toLocaleString()}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span className={`pill ${o.status}`}>
                {LABELS[o.status] || o.status}
              </span>
              {o.shipment && (
                <div className="muted" style={{ marginTop: 6 }}>
                  Shipment: {o.shipment.status.replace(/_/g, " ")}
                </div>
              )}
            </div>
          </div>
        </Link>
      ))}
    </section>
  );
}
