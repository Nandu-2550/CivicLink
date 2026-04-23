import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { setCitizenSession } from "../lib/auth";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("citizen");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (role === "authority-admin") {
        navigate("/authority-login");
        return;
      }
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ identifier, password, role }),
      });
      setCitizenSession(data);
      navigate("/dashboard");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page-wrap">
      <div className="glass-card glow-border w-full max-w-md p-8">
        <h1 className="brand-title">CivicLink</h1>
        <p className="subtitle">Login with Email ID or Username</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          {error ? <p className="error-box">{error}</p> : null}
          <select value={role} onChange={(event) => setRole(event.target.value)}>
            <option value="citizen">Citizen (Complainant)</option>
            <option value="authority-admin">Authority/Admin (Resolver)</option>
          </select>
          <input
            type="text"
            placeholder="Email ID or Username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="btn-primary w-full" type="submit" disabled={loading}>
            {loading ? "Signing in..." : role === "authority-admin" ? "Continue as Authority/Admin" : "Login"}
          </button>
        </form>

        <p className="helper-text">
          New citizen? <Link to="/signup">Create account</Link>
        </p>
        <p className="helper-text">
          <Link to="/authority-login">Authority login</Link>
        </p>
      </div>
    </section>
  );
}
