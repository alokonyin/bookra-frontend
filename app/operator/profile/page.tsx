"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function OperatorProfile() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    company_name: "",
    logo_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // ✅ Load current operator data
  useEffect(() => {
    const token =
      localStorage.getItem("bookra_token") || localStorage.getItem("token");
    if (!token) {
      router.replace("/signin");
      return;
    }

    (async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/v1/operator/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();
        setForm({
          name: data.name || "",
          company_name: data.company_name || "",
          logo_url: data.logo_url || "",
        });
      } catch (err: any) {
        setMsg(err.message);
      }
    })();
  }, [router]);

  // ✅ Submit updates
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const token =
      localStorage.getItem("bookra_token") || localStorage.getItem("token");

    try {
      const res = await fetch("http://127.0.0.1:8000/v1/operator/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Update failed");
      }

      setMsg("✅ Profile updated successfully");
    } catch (err: any) {
      setMsg(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-max">
      <div className="card p-6 mt-4 max-w-lg mx-auto">
        <h2 className="text-2xl font-bold mb-4">Operator Profile</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <div className="font-semibold text-gray-700 mb-1">Full Name</div>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. John Lado"
            />
          </div>

          <div>
            <div className="font-semibold text-gray-700 mb-1">Company Name</div>
            <input
              className="input"
              value={form.company_name}
              onChange={(e) =>
                setForm({ ...form, company_name: e.target.value })
              }
              placeholder="e.g. Juba Line"
            />
          </div>

          <div>
            <div className="font-semibold text-gray-700 mb-1">Logo URL</div>
            <input
              className="input"
              value={form.logo_url}
              onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
              placeholder="https://example.com/logo.png"
            />
          </div>

          <button className="btn w-full" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
          {msg && (
            <p
              className={`text-center text-sm ${
                msg.startsWith("✅") ? "text-green-600" : "text-red-600"
              }`}
            >
              {msg}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
