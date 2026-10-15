import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function Checkout() {
  const items = JSON.parse(localStorage.getItem("cart") || "[]");
  const [u, setU] = useState(null);
  const [m, setM] = useState("");
  const [busy, setBusy] = useState(false);
  const total = items.reduce((s, x) => s + x.price * x.quantity, 0);

  useEffect(() => {
    api
      .get("/me")
      .then((r) => setU(r.data))
      .catch(() => setM("Your session expired. Please login again."));
  }, []);

  const pay = async () => {
    setM("");
    setBusy(true);
    try {
      // Only send id + quantity. The server looks up the real prices.
      const r = await api.post("/checkout", {
        items: items.map(({ id, quantity }) => ({ id, quantity })),
      });
      localStorage.setItem("lastOrder", r.data.order_id);
      location.href = r.data.checkout_url; // cart is cleared on the Success page
    } catch (x) {
      setM(x.response?.data?.message || "Checkout failed. Please try again.");
      setBusy(false);
    }
  };

  if (items.length === 0)
    return (
      <section className="empty card">
        <h2>Nothing to check out</h2>
        <Link to="/products" className="btn">
          Browse products
        </Link>
      </section>
    );

  return (
    <section>
      <Link to="/cart">← Back to cart</Link>
      <h1>Review your order</h1>

      <div className="card">
        <h3>Items</h3>
        {items.map((x) => (
          <div className="row" key={x.id} style={{ padding: "6px 0" }}>
            <span>
              {x.title} × {x.quantity}
            </span>
            <span>₱{(x.price * x.quantity).toFixed(2)}</span>
          </div>
        ))}
        <hr style={{ border: 0, borderTop: "1px solid var(--line)" }} />
        <div className="row total">
          <span>Total</span>
          <span>₱{total.toFixed(2)}</span>
        </div>
      </div>

      <div className="card">
        <h3>Delivering to</h3>
        {u ? (
          <div className="addr">
            {u.name} · {u.contact}
            <br />
            {u.address}
          </div>
        ) : (
          !m && <p className="muted">Loading...</p>
        )}
      </div>

      <div className="card">
        <h3>Payment</h3>
        <p className="muted">
          You'll be redirected to PayMongo to pay by card, GCash, or Maya. This
          is <b>test mode</b>, so no real money is charged.
        </p>
        {m && (
          <div className="alert">
            {m} {m.includes("session") && <Link to="/login">Login</Link>}
          </div>
        )}
        <button className="btn full" onClick={pay} disabled={busy || !u}>
          {busy
            ? "Redirecting to PayMongo..."
            : `Place order · ₱${total.toFixed(2)}`}
        </button>
      </div>
    </section>
  );
}
