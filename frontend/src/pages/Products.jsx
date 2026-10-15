import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api";

const label = (c) => c.replace(/-/g, " ");

export default function Products() {
  const [p, setP] = useState([]);
  const [load, setLoad] = useState(true);
  const [err, setErr] = useState("");
  const [toast, setToast] = useState("");
  const [sort, setSort] = useState("featured");
  const [sp, setSp] = useSearchParams();
  const cat = sp.get("category") || "all";
  const q = (sp.get("q") || "").toLowerCase();

  const fetchAll = () => {
    setLoad(true);
    setErr("");
    api
      .get("/products")
      .then((r) => setP(r.data.products || r.data))
      .catch(() => setErr("Unable to load products. Please try again."))
      .finally(() => setLoad(false));
  };
  useEffect(fetchAll, []);

  const cats = useMemo(
    () => [...new Set(p.map((x) => x.category).filter(Boolean))],
    [p],
  );
  const list = useMemo(() => {
    let l = p.filter(
      (x) =>
        (cat === "all" || x.category === cat) &&
        (!q || x.title.toLowerCase().includes(q)),
    );
    if (sort === "low") l = [...l].sort((a, b) => a.price - b.price);
    if (sort === "high") l = [...l].sort((a, b) => b.price - a.price);
    if (sort === "rating")
      l = [...l].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return l;
  }, [p, cat, q, sort]);

  const setCat = (c) => {
    const n = new URLSearchParams(sp);
    c === "all" ? n.delete("category") : n.set("category", c);
    setSp(n);
  };

  const add = (x) => {
    const c = JSON.parse(localStorage.getItem("cart") || "[]");
    const found = c.find((i) => i.id === x.id);
    found
      ? (found.quantity += 1)
      : c.push({ id: x.id, title: x.title, price: x.price, quantity: 1 });
    localStorage.setItem("cart", JSON.stringify(c));
    window.dispatchEvent(new Event("cart-updated"));
    setToast(`Added “${x.title}” to cart`);
    setTimeout(() => setToast(""), 1800);
  };

  return (
    <section>
      <h1>{q ? `Results for “${sp.get("q")}”` : "All products"}</h1>
      <div className="bar">
        <div className="chips">
          {["all", ...cats].map((c) => (
            <button
              key={c}
              className={`chip ${cat === c ? "on" : ""}`}
              onClick={() => setCat(c)}
            >
              {label(c)}
            </button>
          ))}
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="featured">Featured</option>
          <option value="low">Price: low to high</option>
          <option value="high">Price: high to low</option>
          <option value="rating">Top rated</option>
        </select>
      </div>

      {err && (
        <div className="alert row">
          {err}{" "}
          <button className="btn ghost" onClick={fetchAll}>
            Retry
          </button>
        </div>
      )}
      {load && (
        <div className="grid">
          {Array.from({ length: 8 }, (_, i) => (
            <div className="sk" key={i} />
          ))}
        </div>
      )}
      {!load && !err && list.length === 0 && (
        <div className="empty">
          <span>🔍</span>No products found. Try another search or category.
        </div>
      )}

      <div className="grid">
        {list.map((x) => {
          const d = x.discountPercentage || 0;
          return (
            <article className="product" key={x.id}>
              {d >= 1 && <span className="off">-{Math.round(d)}%</span>}
              <div className="img">
                <img
                  src={x.thumbnail || x.images?.[0]}
                  alt={x.title}
                  loading="lazy"
                />
              </div>
              <div className="body">
                <h3>{x.title}</h3>
                <div className="rate">
                  <b>★</b> {x.rating ?? "–"} · {label(x.category || "")}
                </div>
                <div className="price">
                  ₱{Number(x.price).toFixed(2)}
                  {d >= 1 && <s>₱{(x.price / (1 - d / 100)).toFixed(2)}</s>}
                </div>
                <button className="btn" onClick={() => add(x)}>
                  Add to Cart
                </button>
              </div>
            </article>
          );
        })}
      </div>
      {toast && <div className="toast">{toast}</div>}
    </section>
  );
}
