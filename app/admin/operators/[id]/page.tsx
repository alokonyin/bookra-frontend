"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditVerifiedOperator() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    company_name: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // ✅ Fetch operator info
  useEffect(() => {
    async function fetchOperator() {
      try {
        const token =
          localStorage.getItem("bookra_token") ||
          localStorage.getItem("token");
        const res = await fetch(`http://127.0.0.1:8000/v1/admin/operators`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load operators");
        const all = await res.json();
        const op = all.find((o: any) => o.id === Number(id));
        if (!op) throw new Error("Operator not found");
        setForm({
          company_name: op.company_name || "",
          contact_name: op.contact_name || "",
          contact_email: op.contact_email || "",
          contact_phone: op.contact_phone || "",
        });
      } catch (err: any) {
        setMsg(err.message);
      }
    }
    fetchOperator();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    try {
      const token =
        localStorage.getItem("bookra_token") || localStorage.getItem("token");

      const res = await fetch(
        `http://127.0.0.1:8000/v1/admin/operators/${id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to update operator");
      }

      setMsg("✅ Operator updated successfully");
      setTimeout(() => router.push("/admin/operators"), 1500);
    } catch (err: any) {
      setMsg("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <div className="max-w-lg mx-auto p-6 mt-10 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Edit Verified Operator</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="font-semibold block mb-1">Company Name</label>
          <input
            name="company_name"
            value={form.company_name}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            placeholder="Trinity Express"
          />
        </div>
        <div>
          <label className="font-semibold block mb-1">Contact Name</label>
          <input
            name="contact_name"
            value={form.contact_name}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="font-semibold block mb-1">Contact Email</label>
          <input
            type="email"
            name="contact_email"
            value={form.contact_email}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            placeholder="trinity@example.com"
          />
        </div>
        <div>
          <label className="font-semibold block mb-1">Contact Phone</label>
          <input
            name="contact_phone"
            value={form.contact_phone}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            placeholder="+211..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          {loading ? "Updating..." : "Update Operator"}
        </button>
      </form>

      {msg && (
        <p className="text-center mt-4 text-sm text-gray-700 font-medium">
          {msg}
        </p>
      )}
    </div>
  );
}
