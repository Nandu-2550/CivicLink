import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { setCitizenSession } from "../lib/auth";

export default function CitizenLogin() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          identifier,
          password
        }),
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
        <h1 className="brand-title">Citizen Login</h1>
        <p className="subtitle">Email or Phone + Password</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          {error ? <p className="error-box">{error}</p> : null}
          
          <input
            type="text"
            placeholder="Email or phone number"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="btn-primary w-full" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="helper-text">
          New user? <Link to="/signup">Create account</Link>
        </p>
        <p className="helper-text">
          Authority? <Link to="/authority-login">Authority login</Link>
        </p>
      </div>
    </section>
  );
}
