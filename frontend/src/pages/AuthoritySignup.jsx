import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DEPARTMENTS } from "../constants";
import { apiFetch } from "../lib/api";
import { setAuthoritySession } from "../lib/auth";

export default function AuthoritySignup() {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await apiFetch("/api/auth/authority-signup", {
        method: "POST",
        body: JSON.stringify({ name, department, employeeId, password }),
      });
      // For authority-admin users, backend returns citizen-compatible token with user data
      // Store as authority session with department
      setAuthoritySession({
        token: data.token,
        department: data.user.department,
      });
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
        <h1 className="brand-title">Authority Signup</h1>
        <p className="subtitle">Register as Authority/Admin</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          {error ? <p className="error-box">{error}</p> : null}
          
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          
          <select 
            value={department} 
            onChange={(e) => setDepartment(e.target.value)}
            required
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Employee ID (unique)"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            required
            minLength={6}
          />

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          <button className="btn-primary w-full" type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Create Authority Account"}
          </button>
        </form>

        <p className="helper-text">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </div>
    </section>
  );
}
