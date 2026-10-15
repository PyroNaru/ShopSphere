import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

const CATS = [
  ["beauty", "Beauty"],
  ["fragrances", "Fragrances"],
  ["furniture", "Furniture"],
  ["groceries", "Groceries"],
];
const ic = {
  stroke: "currentColor",
  fill: "none",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  viewBox: "0 0 24 24",
  className: "perk-ic",
};
const Lock = () => (
  <svg {...ic}>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 018 0v3" />
  </svg>
);
const Box = () => (
  <svg {...ic}>
    <path d="M21 8l-9-5-9 5v8l9 5 9-5z" />
    <path d="M3 8l9 5 9-5M12 13v8" />
  </svg>
);
const Bolt = () => (
  <svg {...ic}>
    <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
  </svg>
);

export default function Home() {
  const [p, setP] = useState([]);
  useEffect(() => {
    api
      .get("/products")
      .then((r) => setP(r.data.products || r.data))
      .catch(() => {});
  }, []);

  return (
    <>
      <section className="hero">
        <div>
          <h1>Everything you need, in one sphere.</h1>
          <p>
            Beauty, home and groceries from one marketplace. Pay securely and
            track every order.
          </p>
          <Link to="/products" className="btn">
            Shop now
          </Link>
        </div>
        <div className="hero-img">
          {p.slice(0, 4).map((x) => (
            <img key={x.id} src={x.thumbnail} alt={x.title} />
          ))}
        </div>
      </section>

      <h2>Shop by category</h2>
      <div className="tiles">
        {CATS.map(([k, l]) => {
          const img = p.find((x) => x.category === k)?.thumbnail;
          return (
            <Link key={k} className="tile" to={`/products?category=${k}`}>
              {img && <img src={img} alt="" />}
              {l}
            </Link>
          );
        })}
      </div>

      <div className="perks">
        <div>
          <Lock />
          <b>Secure checkout</b>
          <br />
          Powered by PayMongo
        </div>
        <div>
          <Box />
          <b>Live order tracking</b>
          <br />
          From preparing to delivered
        </div>
        <div>
          <Bolt />
          <b>Fast and simple</b>
          <br />
          Add to cart, pay, done
        </div>
      </div>
    </>
  );
}
