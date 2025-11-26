"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") || "traveler";

  // Redirect to the appropriate signup page
  useEffect(() => {
    if (initialRole === "operator") {
      router.replace("/signup/operator");
    } else {
      router.replace("/signup/traveler");
    }
  }, [initialRole, router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <p className="text-gray-500">Redirecting...</p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><p className="text-gray-500">Loading...</p></div>}>
      <SignupContent />
    </Suspense>
  );
}

// Keep the old implementation below as backup (not rendered)
function OldSignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") || "traveler";

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: initialRole,
    company_name: "",
    company_domain: "",
  });
  const [error, setError] = useState<string | null>(null);

  // ✅ Auto-redirect if already logged in
  // ✅ Auto-redirect if already logged in (but skip if you just came to signup)
  useEffect(() => {
    const token = localStorage.getItem("bookra_token");
    const pathname = window.location.pathname;

    if (token && !pathname.includes("/signup")) {
      const userRole = localStorage.getItem("bookra_role");
      if (userRole === "operator") router.replace("/operator");
      else if (userRole === "traveler") router.replace("/traveler");
      else if (userRole === "admin") router.replace("/admin");
      else router.replace("/");
    }
  }, [router]);

const handleSubmit = async (e: any) => {
  e.preventDefault();
  setError(null);

  // 🧹 Clean up accidental '@' in domain
  const cleanedDomain = form.company_domain.includes("@")
    ? form.company_domain.split("@")[1]
    : form.company_domain;

  const payload = { ...form, company_domain: cleanedDomain };

  try {
    const res = await fetch("http://127.0.0.1:8000/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.detail || "Signup failed");
      return;
    }

    // ✅ After signup, clear form + redirect to login
    setForm({
      name: "",
      email: "",
      phone: "",
      password: "",
      role: initialRole,
      company_name: "",
      company_domain: "",
    });

    alert("✅ Account created successfully! Please sign in to continue.");
    router.push("/signin");
  } catch (err) {
    console.error(err);
    setError("Something went wrong. Please try again.");
  }
};

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-white to-[#fff7f8]">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow max-w-sm w-full"
      >
        <h2 className="text-xl font-bold text-center mb-6">Create Account</h2>

        {error && (
          <div className="bg-red-100 text-red-700 px-3 py-2 rounded mb-3">
            {error}
          </div>
        )}

        {/* Full Name */}
        <input
          type="text"
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border p-2 rounded w-full mb-2"
          required
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border p-2 rounded w-full mb-2"
          required
        />

        {/* Phone */}
        <input
          type="text"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="border p-2 rounded w-full mb-2"
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="border p-2 rounded w-full mb-2"
          required
        />

        {/* Role Selector */}
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="border p-2 rounded w-full mb-2"
        >
          <option value="traveler">Traveler</option>
          <option value="operator">Operator</option>
        </select>

        {/* 🏢 Company info (only for operators) */}
        {form.role === "operator" && (
          <>
            <input
              type="text"
              placeholder="Company Name"
              value={form.company_name}
              onChange={(e) =>
                setForm({ ...form, company_name: e.target.value })
              }
              className="border p-2 rounded w-full mb-2"
              required
            />
            <input
              type="text"
              placeholder="Company Domain (e.g., mololine.co.ke)"
              value={form.company_domain}
              onChange={(e) =>
                setForm({ ...form, company_domain: e.target.value })
              }
              className="border p-2 rounded w-full mb-2"
              required
            />
            <p className="text-xs text-blue-600 mt-[-4px] mb-2">
              You must use your verified company email (e.g., @mololine.co.ke)
            </p>
          </>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white w-full py-2 rounded mt-3"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}


