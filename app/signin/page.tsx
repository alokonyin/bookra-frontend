"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import { saveAuth } from "@/lib/auth";

export default function Signin() {
  const r = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (!identifier || !password) {
      setMsg("Enter identifier and password.");
      return;
    }

    try {
      setLoading(true);

      // 🔐 Send login request
      const data = await login({ identifier, password });
      const user = data.user;
      const token = data.access_token;

      // 🧠 Store auth (in both localStorage and cookies)
      saveAuth(token, user);

      // 🧭 Route based on role
      if (user.role === "operator") {
        r.push("/operator");
      }
      else if (user.role === "traveler") {
        r.push("/traveler");
      }
      else if (user.role === "admin") {
        r.push("/admin");
      }
      else if (user.role === "office") {
        r.push("/office/dashboard");
      }
      else {
        r.push("/");
      }

    } catch (err: any) {
      console.error("Login error:", err);
      setMsg(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="card max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">Welcome Back</h2>
          <p className="text-neutral-600">
            Sign in to your account to continue
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Phone Number or Email
            </label>
            <input
              className="input"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="+254712345678 or 0712345678"
            />
            <p className="text-xs text-neutral-500 mt-1.5">
              Travelers: Use your phone number. Operators: Use email or phone.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Password
            </label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button className="btn w-full !mt-6" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {msg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-center text-sm text-red-600">{msg}</p>
            </div>
          )}
        </form>

        <div className="mt-6 pt-6 border-t border-neutral-200">
          <p className="text-center text-sm text-neutral-600">
            Don't have an account?{" "}
            <a className="font-semibold text-primary-600 hover:text-primary-700 transition-colors" href="/signup/traveler">
              Sign up as Traveler
            </a>
            {" or "}
            <a className="font-semibold text-primary-600 hover:text-primary-700 transition-colors" href="/signup/operator">
              Operator
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

