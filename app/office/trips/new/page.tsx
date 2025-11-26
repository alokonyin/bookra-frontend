"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import cities from "../../../../data/cities.json";

export default function OfficeAddTripPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    from_city: "",
    to_city: "",
    date: "",
    time: "",
    price: "",
    total_seats: "",
    mode: "bus",
    office_id: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = () => {
    localStorage.removeItem("bookra_token");
    localStorage.removeItem("bookra_user");
    localStorage.removeItem("office_role");
    router.push("/signin");
  };

  // Fetch user's office_id on mount
  useEffect(() => {
    const userStr = localStorage.getItem("bookra_user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.office_id) {
          setForm((prev) => ({ ...prev, office_id: user.office_id.toString() }));
        }
      } catch (err) {
        console.error("Failed to parse user data:", err);
      }
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.from_city || !form.to_city || !form.date || !form.time) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      setError("Price must be greater than 0.");
      return;
    }
    if (!form.total_seats || Number(form.total_seats) < 1) {
      setError("Total seats must be at least 1.");
      return;
    }
    if (!form.office_id) {
      setError("Office ID not found. Please contact your operator.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("bookra_token");

      const payload = {
        from_city: form.from_city.trim(),
        to_city: form.to_city.trim(),
        date: form.date,
        time: form.time,
        total_seats: Number(form.total_seats),
        price: Number(form.price),
        mode: form.mode.toLowerCase() as "bus" | "flight",
        office_id: Number(form.office_id),
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/v1/operator/trips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to create trip");
      }

      await res.json();
      router.push("/office/trips");
    } catch (err: any) {
      setError(err.message || "Failed to create trip.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => router.push("/office/trips")}
            className="text-blue-600 hover:text-blue-700"
          >
            ← Back to Trips
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>
        <h1 className="text-2xl font-semibold">Add New Trip</h1>
        <p className="text-gray-600 mt-1">Create a new trip for your office</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Autocomplete "From" */}
        <input
          list="cities"
          className="w-full border rounded-lg px-3 py-2"
          placeholder="From City"
          value={form.from_city}
          onChange={(e) => setForm({ ...form, from_city: e.target.value })}
          required
        />

        {/* Autocomplete "To" */}
        <input
          list="cities"
          className="w-full border rounded-lg px-3 py-2"
          placeholder="To City"
          value={form.to_city}
          onChange={(e) => setForm({ ...form, to_city: e.target.value })}
          required
        />

        {/* Shared datalist for both */}
        <datalist id="cities">
          {cities.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>

        <input
          type="date"
          className="w-full border rounded-lg px-3 py-2"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
        />
        <input
          type="time"
          className="w-full border rounded-lg px-3 py-2"
          value={form.time}
          onChange={(e) => setForm({ ...form, time: e.target.value })}
          required
        />
        <input
          type="number"
          min={1}
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Total Seats"
          value={form.total_seats}
          onChange={(e) => setForm({ ...form, total_seats: e.target.value })}
          required
        />
        <input
          type="number"
          step="0.01"
          min={0}
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
        />

        <select
          className="w-full border rounded-lg px-3 py-2"
          value={form.mode}
          onChange={(e) => setForm({ ...form, mode: e.target.value })}
        >
          <option value="bus">Bus</option>
          <option value="flight">Flight</option>
        </select>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          className={`w-full rounded-lg px-4 py-2 text-white ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Trip"}
        </button>
      </form>
    </div>
  );
}
