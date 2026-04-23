import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DEPARTMENTS } from "../constants";
import { apiFetch } from "../lib/api";
import { setAuthoritySession } from "../lib/auth";

export default function AuthorityLogin() {
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiFetch("/api/auth/authority-login", {
        method: "POST",
        body: JSON.stringify({ department, accessCode }),
      });
      setAuthoritySession(data);
      navigate("/authority-dashboard");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page-wrap">
      <div className="glass-card glow-border w-full max-w-md p-8">
        <h1 className="brand-title">Authority Login</h1>
        <p className="subtitle">Department + secret access code</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          {error ? <p className="error-box">{error}</p> : null}
          <select value={department} onChange={(e) => setDepartment(e.target.value)} required>
            {DEPARTMENTS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <input
            type="password"
            placeholder="Secret Access Code"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            required
          />
          <button className="btn-primary w-full" type="submit" disabled={loading}>
            {loading ? "Authenticating..." : "Enter dashboard"}
          </button>
        </form>
        <p className="helper-text">
          <Link to="/login">Back to citizen login</Link>
        </p>
      </div>
    </section>
  );
}
