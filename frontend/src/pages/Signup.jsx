import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { setCitizenSession } from "../lib/auth";

export default function Signup() {
  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [identifier, setIdentifier] = useState(""); // email or phone
  const navigate = useNavigate();

  async function onSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const isEmail = identifier.includes('@');
      const payload = {
        name,
        email: isEmail ? identifier : "",
        contactNumber: !isEmail ? identifier : contactNumber,
        address,
        role: "citizen",
        password,
      };

      const signupData = await apiFetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      
      setCitizenSession(signupData);
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
          <input 
            type="text" 
            placeholder="Email or Phone number" 
            value={identifier} 
            onChange={(e) => setIdentifier(e.target.value)} 
            required 
          />
          <input type="text" placeholder="Address / Location" value={address} onChange={(e) => setAddress(e.target.value)} required />
          <input
            type="password"
            placeholder="Create password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
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
