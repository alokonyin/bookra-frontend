"use client";
import { useState } from "react";

export default function FlightSearchPage() {
  const [results, setResults] = useState<any[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token =
        localStorage.getItem("bookra_token") || localStorage.getItem("token");
      const url = new URL("http://127.0.0.1:8000/v1/traveler/search");
      url.search = new URLSearchParams({
        from_city: from,
        to_city: to,
        date,
        mode: "flight", // ✅ force mode = flight
      }).toString();

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Search Flights</h1>

      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          className="border p-2 rounded"
          placeholder="From"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          required
        />
        <input
          className="border p-2 rounded"
          placeholder="To"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          required
        />
        <input
          className="border p-2 rounded"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="space-y-4">
        {results.map((trip) => (
          <div
            key={trip.id}
            className="p-4 bg-white shadow rounded flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{trip.from_city} → {trip.to_city}</p>
              <p className="text-sm text-gray-500">{trip.date} • {trip.time}</p>
              <p className="text-sm mt-1">{trip.seats_available} seats available</p>
              <p className="text-xs text-gray-500 mt-1">Operator: {trip.operator?.name}</p>
            </div>
            <div className="text-right">
              <p className="font-bold">${trip.price}</p>
              <a
                href={`/traveler/confirm/${trip.id}`}
                className="bg-green-600 text-white px-3 py-2 rounded inline-block mt-2 hover:bg-green-700"
              >
                Select
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
