import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Navigate,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Cart from "./pages/Cart";
import Dashboard from "./pages/Dashboard";
import Success from "./pages/Success";
import Failed from "./pages/Failed";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Checkout from "./pages/Checkout";

const cartCount = () =>
  JSON.parse(localStorage.getItem("cart") || "[]").reduce(
    (s, x) => s + x.quantity,
    0,
  );

// Frontend route guard (the API is also protected by Sanctum on the server)
const RequireAuth = ({ children }) =>
  localStorage.getItem("token") ? children : <Navigate to="/login" replace />;

function Header() {
  useLocation(); // re-render on navigation so login/logout state stays fresh
  const nav = useNavigate();
  const [n, setN] = useState(cartCount());
  const [q, setQ] = useState("");
  const authed = !!localStorage.getItem("token");

  useEffect(() => {
    const f = () => setN(cartCount());
    window.addEventListener("cart-updated", f);
    return () => window.removeEventListener("cart-updated", f);
  }, []);

  const search = (e) => {
    e.preventDefault();
    nav(`/products?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header className="hdr">
      <div className="wrap">
        <Link to="/" className="logo">
          <i /> ShopSphere
        </Link>
        <form className="search" onSubmit={search}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products..."
          />
          <button>Search</button>
        </form>
        <nav className="nav">
          <NavLink to="/products">Shop</NavLink>
          <NavLink to="/cart">
            Cart{n > 0 && <span className="badge">{n}</span>}
          </NavLink>
          {authed ? (
            <>
              <NavLink to="/orders">Orders</NavLink>
              <NavLink to="/dashboard">Account</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register" className="cta">
                Register
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <>
      <Header />
      <main className="wrap">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<Cart />} />
          <Route
            path="/checkout"
            element={
              <RequireAuth>
                <Checkout />
              </RequireAuth>
            }
          />
          <Route
            path="/orders"
            element={
              <RequireAuth>
                <Orders />
              </RequireAuth>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <RequireAuth>
                <OrderDetail />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route path="/success" element={<Success />} />
          <Route path="/failed" element={<Failed />} />
        </Routes>
      </main>
      <footer className="ftr">
        <div className="wrap">
          <span>© 2026 ShopSphere · School project prototype</span>
          <span>
            Payments run in PayMongo TEST mode. No real money is charged.
          </span>
        </div>
      </footer>
    </>
  );
}
