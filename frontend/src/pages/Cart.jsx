import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Cart() {
  const nav = useNavigate();
  const [c, setC] = useState(() =>
    JSON.parse(localStorage.getItem("cart") || "[]"),
  );
  const total = c.reduce((s, x) => s + x.price * x.quantity, 0);

  const save = (next) => {
    setC(next);
    localStorage.setItem("cart", JSON.stringify(next));
    window.dispatchEvent(new Event("cart-updated"));
  };
  const changeQty = (i, d) =>
    save(
      c.map((x, idx) =>
        idx === i ? { ...x, quantity: Math.max(1, x.quantity + d) } : x,
      ),
    );
  const removeItem = (i) => save(c.filter((_, idx) => idx !== i));

  if (c.length === 0)
    return (
      <section className="empty card">
        <h2>Your cart is empty</h2>
        <p className="muted">Looks like you haven't added anything yet.</p>
        <Link to="/products" className="btn">
          Browse products
        </Link>
      </section>
    );

  return (
    <section>
      <h1>Your cart</h1>
      {c.map((x, i) => (
        <div className="card row" key={x.id ?? i}>
          <div>
            <strong>{x.title}</strong>
            <div className="muted">₱{Number(x.price).toFixed(2)} each</div>
          </div>
          <div className="row">
            <div className="qty">
              <button onClick={() => changeQty(i, -1)}>−</button>
              <span>{x.quantity}</span>
              <button onClick={() => changeQty(i, 1)}>+</button>
            </div>
            <button className="btn danger" onClick={() => removeItem(i)}>
              Remove
            </button>
          </div>
        </div>
      ))}
      <div className="card row">
        <span className="total">Total: ₱{total.toFixed(2)}</span>
        <button className="btn" onClick={() => nav("/checkout")}>
          Proceed to checkout
        </button>
      </div>
    </section>
  );
}
