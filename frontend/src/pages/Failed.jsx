import { Link } from "react-router-dom";
export default function Failed() {
  return (
    <section className="card center">
      <div className="mark no">✕</div>
      <h1>Payment cancelled or failed</h1>
      <p className="muted">
        Your payment did not go through and you haven't been charged. Your cart
        is still saved, so you can try again anytime.
      </p>
      <Link to="/cart" className="btn">
        Back to cart
      </Link>
    </section>
  );
}
