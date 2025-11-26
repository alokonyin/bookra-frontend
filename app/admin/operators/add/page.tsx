"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminOperatorsPage() {
  const router = useRouter();
  const [operators, setOperators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [newOperator, setNewOperator] = useState({
    company_name: "",
    company_domain: "", // ✅ domain now part of state
    contact_name: "",
    contact_email: "",
    contact_phone: "",
  });

  async function fetchOperators() {
    try {
      const token = localStorage.getItem("bookra_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/v1/admin/operators`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOperators(data);
    } catch (err) {
      console.error("Failed to fetch operators:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOperators();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setNewOperator((prev) => ({ ...prev, [name]: value }));
  }

  async function handleAddOperator(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    try {
      const token = localStorage.getItem("bookra_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/v1/admin/operators`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newOperator),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 400 && data.existing_operator) {
          setMessage(
            `⚠️ Operator already exists: ${data.existing_operator.company_name}.`
          );
        } else {
          setMessage(data.detail || "Failed to create operator");
        }
        return;
      }

      setMessage("✅ Operator added successfully!");
      setNewOperator({
        company_name: "",
        company_domain: "",
        contact_name: "",
        contact_email: "",
        contact_phone: "",
      });

      await fetchOperators();
    } catch (err) {
      console.error(err);
      setMessage("Error adding operator.");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this operator?")) return;
    try {
      const token = localStorage.getItem("bookra_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/v1/admin/operators/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMessage("✅ Operator deleted.");
        await fetchOperators();
      } else {
        const data = await res.json();
        setMessage(data.detail || "Failed to delete operator.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error deleting operator.");
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Verified Operators</h1>

      {/* Add new operator form */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="font-semibold mb-3">➕ Add New Operator</h2>

        <form
          onSubmit={handleAddOperator}
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          {/* 🧩 Company Name */}
          <input
            name="company_name"
            value={newOperator.company_name}
            onChange={handleChange}
            placeholder="Company Name"
            className="border p-2 rounded w-full"
            required
          />

          {/* 🆕 Company Domain */}
          <input
            name="company_domain"
            value={newOperator.company_domain}
            onChange={handleChange}
            placeholder="Company Domain (e.g., mololine.co.ke)"
            className="border p-2 rounded w-full"
            required
          />

          {/* Contact Name */}
          <input
            name="contact_name"
            value={newOperator.contact_name}
            onChange={handleChange}
            placeholder="Contact Name"
            className="border p-2 rounded w-full"
          />

          {/* Contact Email */}
          <input
            name="contact_email"
            value={newOperator.contact_email}
            onChange={handleChange}
            placeholder="Contact Email"
            className="border p-2 rounded w-full"
          />

          {/* Contact Phone */}
          <input
            name="contact_phone"
            value={newOperator.contact_phone}
            onChange={handleChange}
            placeholder="Contact Phone"
            className="border p-2 rounded w-full"
          />

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded md:col-span-2"
          >
            Add Operator
          </button>
        </form>

        {message && (
          <p className="mt-3 text-sm text-green-700 font-medium">{message}</p>
        )}
      </div>

      {/* Table */}
      <h2 className="font-semibold mb-2">Verified Operators</h2>
      {loading ? (
        <p>Loading...</p>
      ) : operators.length === 0 ? (
        <p>No verified operators yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2 border">#</th>
                <th className="p-2 border">Company Name</th>
                <th className="p-2 border">Domain</th>
                <th className="p-2 border">Contact Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Phone</th>
                <th className="p-2 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {operators.map((op, idx) => (
                <tr key={op.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 border">{idx + 1}</td>
                  <td className="p-2 border font-semibold">{op.company_name}</td>
                  <td className="p-2 border">{op.company_domain || "-"}</td>
                  <td className="p-2 border">{op.contact_name || "-"}</td>
                  <td className="p-2 border">{op.contact_email || "-"}</td>
                  <td className="p-2 border">{op.contact_phone || "-"}</td>
                  <td className="p-2 border text-center space-x-2">
                    <button
                      onClick={() =>
                        router.push(`/admin/operators/edit/${op.id}`)
                      }
                      className="bg-yellow-400 text-black px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(op.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

