"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import cities from "../../../../data/cities.json"; // ✅ import local city list

interface Office {
  id: number;
  office_name: string;
  city: string;
  is_active: boolean;
}

export default function AddTripPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    from_city: "",
    to_city: "",
    date: "",
    time: "",
    price: "",
    total_seats: "",
    mode: "bus", // default
    office_id: "", // ✅ Added office_id
  });

  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Fetch offices on mount
  useEffect(() => {
    async function fetchOffices() {
      try {
        const token = localStorage.getItem("bookra_token") || localStorage.getItem("token");
        const res = await fetch("http://127.0.0.1:8000/v1/offices/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setOffices(data.filter((o: Office) => o.is_active));
        }
      } catch (err) {
        console.error("Failed to fetch offices:", err);
      }
    }
    fetchOffices();
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
      setError("Please select an office.");
      return;
    }

    setLoading(true);
    try {
      const token =
        localStorage.getItem("bookra_token") || localStorage.getItem("token");

      const payload = {
        from_city: form.from_city.trim(),
        to_city: form.to_city.trim(),
        date: form.date,
        time: form.time,
        total_seats: Number(form.total_seats),
        price: Number(form.price),
        mode: form.mode.toLowerCase() as "bus" | "flight",
        office_id: Number(form.office_id), // ✅ Added office_id
      };

      const res = await fetch("http://127.0.0.1:8000/v1/operator/trips", {
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
      router.push("/operator/trips");
    } catch (err: any) {
      setError(err.message || "Failed to create trip.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-5">Add New Trip</h1>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* ✅ Office Selection */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Select Office *
          </label>
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={form.office_id}
            onChange={(e) => setForm({ ...form, office_id: e.target.value })}
            required
          >
            <option value="">-- Select an office --</option>
            {offices.map((office) => (
              <option key={office.id} value={office.id}>
                {office.office_name} - {office.city}
              </option>
            ))}
          </select>
        </div>

        {/* ✅ Autocomplete "From" */}
        <input
          list="cities"
          className="w-full border rounded-lg px-3 py-2"
          placeholder="From City"
          value={form.from_city}
          onChange={(e) => setForm({ ...form, from_city: e.target.value })}
          required
        />

        {/* ✅ Autocomplete “To” */}
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
            loading ? "bg-gray-400" : "bg-black hover:bg-gray-800"
          }`}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Trip"}
        </button>
      </form>
    </div>
  );
}
