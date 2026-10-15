import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function Success() {
  const [order, setOrder] = useState(null);
  const [gaveUp, setGaveUp] = useState(false);
  const id = localStorage.getItem("lastOrder");

  useEffect(() => {
    // Payment succeeded, so the cart can be cleared now
    localStorage.removeItem("cart");
    window.dispatchEvent(new Event("cart-updated"));
    if (!id) return;

    // The webhook may take a few seconds, so poll the order status
    let tries = 0,
      stop = false;
    const tick = async () => {
      try {
        const r = await api.get(`/orders/${id}`);
        if (stop) return;
        setOrder(r.data);
        if (r.data.status === "paid") return;
      } catch {}
      if (++tries >= 8) return setGaveUp(true);
      setTimeout(tick, 2000);
    };
    tick();
    return () => {
      stop = true;
    };
  }, [id]);

  const paid = order?.status === "paid";

  return (
    <section className="card center">
      <div className="mark ok">✓</div>
      <h1>{paid ? "Payment successful" : "Confirming your payment..."}</h1>
      {paid ? (
        <p className="muted">
          Thank you for your order! Your payment has been confirmed.
        </p>
      ) : gaveUp ? (
        <p className="muted">
          Your payment is still being confirmed. Check your orders in a moment.
        </p>
      ) : (
        <p className="muted">This only takes a few seconds.</p>
      )}
      {order && (
        <p>
          Order <strong>#{order.id}</strong> · ₱
          {Number(order.amount).toFixed(2)}
        </p>
      )}
      <Link to={order ? `/orders/${order.id}` : "/orders"} className="btn">
        {paid ? "Track your order" : "View my orders"}
      </Link>
    </section>
  );
}
