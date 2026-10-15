import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";

const STEPS = [
  { key: "preparing", label: "Preparing" },
  { key: "shipped", label: "Shipped" },
  { key: "in_transit", label: "In Transit" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];

function Timeline({ currentStatus }) {
  const cur = STEPS.findIndex((s) => s.key === currentStatus);
  return (
    <div className="steps">
      {STEPS.map((step, i) => {
        const done = i <= cur,
          now = i === cur;
        return (
          <div className="step" key={step.key}>
            <div className="rail">
              <div
                className={`dot ${done ? "done" : ""} ${now ? "now" : ""}`}
              />
              {i < STEPS.length - 1 && (
                <div className={`line ${i < cur ? "done" : ""}`} />
              )}
            </div>
            <div className={`lbl ${done ? "done" : ""} ${now ? "now" : ""}`}>
              {step.label}
              {now && <div className="muted">Current status</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [m, setM] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get(`/orders/${id}`)
      .then((r) => setOrder(r.data))
      .catch(() => setM("Order not found."))
      .finally(() => setLoading(false));
  }, [id]);

  const advance = async () => {
    setBusy(true);
    try {
      const r = await api.post(`/orders/${id}/advance`);
      setOrder(r.data);
    } catch {
      setM("Could not update the shipment.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <p className="muted">Loading...</p>;
  if (m) return <div className="alert">{m}</div>;
  if (!order) return null;

  const items =
    typeof order.items === "string" ? JSON.parse(order.items) : order.items;
  const shipment = order.shipment;

  return (
    <section>
      <Link to="/orders">← Back to orders</Link>
      <h1>Order #{order.id}</h1>
      <p className="muted">
        Placed {new Date(order.created_at).toLocaleString()}
      </p>

      <div className="card">
        <h3>Items</h3>
        {items.map((it, i) => (
          <div className="row" key={i} style={{ padding: "6px 0" }}>
            <span>
              {it.title} × {it.quantity}
            </span>
            <span>₱{(it.price * it.quantity).toFixed(2)}</span>
          </div>
        ))}
        <hr style={{ border: 0, borderTop: "1px solid var(--line)" }} />
        <div className="row total">
          <span>Total</span>
          <span>₱{Number(order.amount).toFixed(2)}</span>
        </div>
        <p>
          <span className={`pill ${order.status}`}>
            {order.status === "paid" ? "Paid" : order.status}
          </span>
        </p>
      </div>

      <div className="card">
        <h3>Delivery tracking</h3>
        {order.shipping_address && (
          <div className="addr">
            <strong>Delivering to</strong>
            <br />
            {order.shipping_name} · {order.shipping_contact}
            <br />
            {order.shipping_address}
          </div>
        )}
        {!shipment ? (
          <p className="muted">
            Shipment will be created once payment is confirmed.
          </p>
        ) : (
          <>
            <div className="meta" style={{ marginTop: 14 }}>
              <div>
                <strong>Carrier:</strong>{" "}
                {shipment.carrier || "Not yet assigned"}
              </div>
              <div>
                <strong>Tracking #:</strong>{" "}
                {shipment.tracking_number || "Not yet assigned"}
              </div>
              <div>
                <strong>Est. delivery:</strong>{" "}
                {shipment.estimated_delivery
                  ? new Date(shipment.estimated_delivery).toLocaleDateString()
                  : "To be confirmed"}
              </div>
            </div>
            <Timeline currentStatus={shipment.status} />
            {shipment.status !== "delivered" && (
              <button className="btn ghost" onClick={advance} disabled={busy}>
                Simulate next delivery step (demo)
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}
