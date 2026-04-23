import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { setCitizenSession } from "../lib/auth";

export default function Signup() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState("citizen");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await apiFetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ name, username, contactNumber, email, address, role, password }),
      });
      if (role === "authority-admin") {
        navigate("/authority-login");
        return;
      }
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
        <p className="subtitle">Create profile before login</p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          {error ? <p className="error-box">{error}</p> : null}
          <input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input type="text" placeholder="Username (unique)" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <input
            type="tel"
            placeholder="Contact number"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            required
          />
          <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="text" placeholder="Address / Location" value={address} onChange={(e) => setAddress(e.target.value)} required />
          <select value={role} onChange={(event) => setRole(event.target.value)}>
            <option value="citizen">Citizen (Complainant)</option>
            <option value="authority-admin">Authority/Admin (Resolver)</option>
          </select>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="btn-primary w-full" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>
        <p className="helper-text">
          Already registered? <Link to="/login">Back to login</Link>
        </p>
      </div>
    </section>
  );
}
