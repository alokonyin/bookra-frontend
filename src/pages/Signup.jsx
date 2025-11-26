// frontend/src/pages/Signup.jsx
import { useState } from "react";
import { apiRequest } from "../api/client";

export default function Signup() {
  const [form, setForm] = useState({ email: "", password: "", role: "traveler" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      await apiRequest("/auth/signup", "POST", form);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="signup-form">
      <h2>Create Traveler Account</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Sign Up"}
        </button>
      </form>
      {success && <p className="success">✅ Account created! You can now log in.</p>}
      {error && <p className="error">⚠️ {error}</p>}
    </div>
  );
}
