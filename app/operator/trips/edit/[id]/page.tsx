"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditTripPage() {
  const router = useRouter();
  const { id } = useParams();
  const [form, setForm] = useState({
    from_city: "",
    to_city: "",
    date: "",
    time: "",
    price: "",
    total_seats: "",
    mode: "bus",
  });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  // ✅ Load trip data
  useEffect(() => {
    async function fetchTrip() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/v1/operator/trips/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("bookra_token")}`,
          },
        });
        if (!res.ok) throw new Error("Failed to load trip");
        const data = await res.json();

        setForm({
          from_city: data.from_city,
          to_city: data.to_city,
          date: data.date,
          time: data.time,
          price: data.price,
          total_seats: data.total_seats,
          mode: data.mode || "bus",
        });
      } catch (err: any) {
        setMsg(`❌ ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    fetchTrip();
  }, [id]);

  // ✅ Update trip
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/v1/operator/trips/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("bookra_token")}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to update trip");
      }

      setMsg("✅ Trip updated successfully!");
      setTimeout(() => router.push("/operator/trips"), 1200);
    } catch (err: any) {
      setMsg(`❌ ${err.message}`);
    }
  }

  if (loading) return <p className="p-6">Loading trip...</p>;

  return (
    <div className="container-max">
      <div className="card p-6 mt-4 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Edit Trip</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <input
            placeholder="From City"
            className="input"
            value={form.from_city}
            onChange={(e) => setForm({ ...form, from_city: e.target.value })}
            required
          />
          <input
            placeholder="To City"
            className="input"
            value={form.to_city}
            onChange={(e) => setForm({ ...form, to_city: e.target.value })}
            required
          />
          <input
            type="date"
            className="input"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
          <input
            type="time"
            className="input"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Price (USD)"
            className="input"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Total Seats"
            className="input"
            value={form.total_seats}
            onChange={(e) => setForm({ ...form, total_seats: e.target.value })}
            required
          />
          <select
            className="input col-span-2"
            value={form.mode}
            onChange={(e) => setForm({ ...form, mode: e.target.value })}
          >
            <option value="bus">Bus</option>
            <option value="flight">Flight</option>
          </select>

          <button
            type="submit"
            className="btn col-span-2 mt-2"
            disabled={loading}
          >
            {loading ? "Updating..." : "Save Changes"}
          </button>
        </form>

        {msg && <p className="mt-4 text-center text-sm">{msg}</p>}
      </div>
    </div>
  );
}
