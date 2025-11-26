"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditOperatorPage() {
  const router = useRouter();
  const { id } = useParams();
  const [form, setForm] = useState({
    company_name: "",
    company_domain: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("bookra_token");
    fetch(`http://127.0.0.1:8000/v1/admin/operators`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        const op = data.find((x: any) => x.id === Number(id));
        if (op) setForm(op);
      });
  }, [id]);

  const handleSave = async () => {
    const token = localStorage.getItem("bookra_token");
    const cleanedDomain = form.company_domain.includes("@")
      ? form.company_domain.split("@")[1]
      : form.company_domain; // 🧹 clean up accidental email entry

    const res = await fetch(`http://127.0.0.1:8000/v1/admin/operators/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify({ ...form, company_domain: cleanedDomain }),
    });

    if (res.ok) {
      setMessage("✅ Operator updated successfully!");
      setTimeout(() => router.push("/admin/operators"), 1200);
    } else {
      const err = await res.json().catch(() => ({}));
      setMessage(`⚠️ ${err.detail || "Update failed"}`);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this operator?")) return;
    const token = localStorage.getItem("bookra_token");
    await fetch(`http://127.0.0.1:8000/v1/admin/operators/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });
    router.push("/admin/operators");
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Operator</h1>

      <div className="space-y-3">
        <input
          placeholder="Company Name"
          value={form.company_name}
          onChange={(e) => setForm({ ...form, company_name: e.target.value })}
          className="border p-2 rounded w-full"
        />
        <input
          type="text" // ✅ no email type
          placeholder="Company Domain (e.g., trinity.co.ke)"
          value={form.company_domain}
          onChange={(e) => setForm({ ...form, company_domain: e.target.value })}
          className="border p-2 rounded w-full"
        />
        <input
          placeholder="Contact Name"
          value={form.contact_name || ""}
          onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
          className="border p-2 rounded w-full"
        />
        <input
          placeholder="Contact Email"
          type="email"
          value={form.contact_email || ""}
          onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
          className="border p-2 rounded w-full"
        />
        <input
          placeholder="Contact Phone"
          value={form.contact_phone || ""}
          onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
          className="border p-2 rounded w-full"
        />

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => router.push("/admin/operators")}
            className="bg-gray-300 px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Delete
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Save Changes
          </button>
        </div>
        {message && <p className="mt-3 text-sm">{message}</p>}
      </div>
    </div>
  );
}
