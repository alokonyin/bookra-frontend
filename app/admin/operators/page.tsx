"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  Edit,
  Trash2,
  Plus,
  Users,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function AdminOperatorsPage() {
  const router = useRouter();
  const [operators, setOperators] = useState<any[]>([]);
  const [form, setForm] = useState({
    company_name: "",
    company_domain: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);
  const [authed, setAuthed] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem("bookra_token");

  const fetchOperators = async () => {
    try {
      setLoading(true);
      const token = getToken();
      setAuthed(!!token);
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}";

      const res = await fetch(`${API_BASE}/v1/admin/operators`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });

      if (!res.ok) {
        setOperators([]);
        return;
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        setOperators(data);
      } else if (data && typeof data === "object" && (data as any).id) {
        setOperators([data]);
      } else {
        setOperators([]);
      }
    } catch (err) {
      console.error("Failed to fetch operators:", err);
      setOperators([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const token = getToken();
    if (!token) {
      setMessage("You're not authenticated. Please log in as Admin.");
      setMessageType("error");
      return;
    }

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}";
    const res = await fetch(`${API_BASE}/v1/admin/operators`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setMessage("Operator added successfully!");
      setMessageType("success");
      setForm({
        company_name: "",
        company_domain: "",
        contact_name: "",
        contact_email: "",
        contact_phone: "",
      });
      fetchOperators();
    } else {
      const err = await res.json().catch(() => ({} as any));
      setMessage(err.detail || err.message || "Something went wrong");
      setMessageType("error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this operator?")) return;

    const token = getToken();
    if (!token) {
      setMessage("You're not authenticated. Please log in as Admin.");
      setMessageType("error");
      return;
    }

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}";
    const res = await fetch(`${API_BASE}/v1/admin/operators/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({} as any));
      setMessage(err.detail || err.message || "Delete failed");
      setMessageType("error");
    } else {
      setMessage("Operator deleted successfully");
      setMessageType("success");
    }
    fetchOperators();
  };

  useEffect(() => {
    fetchOperators();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-indigo-600 font-medium">Loading operators...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-xl shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Manage Operators
              </h1>
              <p className="text-gray-600 mt-1">Add and manage verified operators</p>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Operators</p>
                <p className="text-3xl font-bold text-gray-800">{operators.length}</p>
              </div>
              <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Status</p>
                <p className="text-lg font-bold text-green-700">
                  {authed ? "Authenticated" : "Not Authenticated"}
                </p>
              </div>
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-3 rounded-lg">
                {authed ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-gray-400" />
                )}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-6 shadow-lg text-white">
            <div className="flex items-center gap-3">
              <Plus className="w-6 h-6" />
              <div>
                <p className="text-indigo-100 text-sm font-medium">Quick Action</p>
                <p className="text-lg font-bold">Add New Operator</p>
              </div>
            </div>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border ${
            messageType === "success"
              ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-700"
              : "bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-700"
          }`}>
            <div className="flex items-center gap-2">
              {messageType === "success" ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <p className="font-medium">{message}</p>
            </div>
          </div>
        )}

        {/* Add Operator Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-lg">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Add New Operator</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company Name *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    placeholder="Enter company name"
                    value={form.company_name}
                    onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company Domain
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    placeholder="e.g., bookra.com"
                    value={form.company_domain}
                    onChange={(e) => setForm({ ...form, company_domain: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contact Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    placeholder="Contact person name"
                    value={form.contact_name}
                    onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contact Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={form.contact_email}
                    onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contact Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    placeholder="+254712345678"
                    value={form.contact_phone}
                    onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-4 rounded-lg font-semibold text-white transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
                authed
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
              disabled={!authed}
            >
              <Plus className="w-5 h-5" />
              Add Operator
            </button>

            {!authed && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 text-amber-700">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm font-medium">Not authenticated. Please log in to add operators.</p>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Operators Grid */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Verified Operators</h2>
          <p className="text-gray-600">Manage all your verified operator accounts</p>
        </div>

        {operators.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center shadow-md">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">No operators found</p>
            <p className="text-gray-400 text-sm mt-2">Add your first operator using the form above</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {operators.map((op, i) => (
              <div
                key={op.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-xl shadow-md">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{op.company_name || "Unnamed Company"}</h3>
                        <p className="text-sm text-gray-600">Operator #{i + 1}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/admin/operators/edit/${op.id}`)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(op.id)}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg font-semibold hover:from-red-600 hover:to-rose-600 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {op.company_domain && (
                      <div className="flex items-start gap-3">
                        <div className="bg-purple-100 p-2 rounded-lg mt-1">
                          <Globe className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Domain</p>
                          <p className="text-gray-900 font-medium text-lg">{op.company_domain}</p>
                        </div>
                      </div>
                    )}

                    {op.contact_name && (
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg mt-1">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Contact Person</p>
                          <p className="text-gray-900 font-medium text-lg">{op.contact_name}</p>
                        </div>
                      </div>
                    )}

                    {op.contact_email && (
                      <div className="flex items-start gap-3">
                        <div className="bg-green-100 p-2 rounded-lg mt-1">
                          <Mail className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Email</p>
                          <p className="text-gray-900 font-medium text-lg">{op.contact_email}</p>
                        </div>
                      </div>
                    )}

                    {op.contact_phone && (
                      <div className="flex items-start gap-3">
                        <div className="bg-orange-100 p-2 rounded-lg mt-1">
                          <Phone className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Phone</p>
                          <p className="text-gray-900 font-medium text-lg">{op.contact_phone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
