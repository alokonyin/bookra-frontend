"use client";

import { useState } from "react";
import cities from "../../data/cities.json"; // ✅ local list

export default function TravelerDashboard() {
  const [activeTab, setActiveTab] = useState<"bus" | "flight">("bus");
  const [results, setResults] = useState<any[]>([]);

  // Bus state
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [passengers, setPassengers] = useState(1);

  // Flight-specific state
  const [tripType, setTripType] = useState<"oneway" | "roundtrip">("oneway");
  const [returnDate, setReturnDate] = useState("");
  const [cabinClass, setCabinClass] = useState("economy");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔍 Perform search (can be called from form or programmatically)
  async function performSearch(
    fromCity: string,
    toCity: string,
    searchDate: string,
    searchMode: string
  ) {
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const token =
        localStorage.getItem("bookra_token") || localStorage.getItem("token");

      const url = new URL(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/v1/traveler/search`);
      url.search = new URLSearchParams({
        from_city: fromCity,
        to_city: toCity,
        date: searchDate,
        mode: searchMode,
      }).toString();

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Search failed");
      }

      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);

      localStorage.setItem(
        "lastSearch",
        JSON.stringify({
          from: fromCity,
          to: toCity,
          date: searchDate,
          passengers,
          mode: searchMode,
        })
      );
    } catch (err: any) {
      console.error("Search error:", err);
      setError(err.message || "Failed to search trips");
    } finally {
      setLoading(false);
    }
  }

  // 🔍 Handle search form submission
  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    performSearch(from, to, date, activeTab);
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Search Trips</h1>

        {/* Search Card */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("bus")}
              className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 transition-colors ${
                activeTab === "bus"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span className="text-xl">🚌</span>
              Buses
            </button>
            <button
              onClick={() => setActiveTab("flight")}
              className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 transition-colors ${
                activeTab === "flight"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span className="text-xl">✈️</span>
              Flights
            </button>
          </div>

          {/* Bus Search Form */}
          {activeTab === "bus" && (
            <form onSubmit={handleSearch}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    list="cities"
                    placeholder="City"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    list="cities"
                    placeholder="City"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departure
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passengers
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="number"
                    min={1}
                    value={passengers}
                    onChange={(e) => setPassengers(Number(e.target.value))}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition"
                disabled={loading}
              >
                {loading ? "Searching..." : "Search Buses"}
              </button>
            </form>
          )}

          {/* Flight Search Form */}
          {activeTab === "flight" && (
            <form onSubmit={handleSearch}>
              {/* Trip Type */}
              <div className="flex gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tripType"
                    value="oneway"
                    checked={tripType === "oneway"}
                    onChange={(e) => setTripType(e.target.value as "oneway")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium">One-way</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tripType"
                    value="roundtrip"
                    checked={tripType === "roundtrip"}
                    onChange={(e) => setTripType(e.target.value as "roundtrip")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium">Round-trip</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    list="cities"
                    placeholder="City"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    list="cities"
                    placeholder="City"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Depart
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                {tripType === "roundtrip" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Return
                    </label>
                    <input
                      className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      required={tripType === "roundtrip"}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passengers
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="number"
                    min={1}
                    value={passengers}
                    onChange={(e) => setPassengers(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cabin Class
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={cabinClass}
                    onChange={(e) => setCabinClass(e.target.value)}
                  >
                    <option value="economy">Economy</option>
                    <option value="business">Business</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition"
                disabled={loading}
              >
                {loading ? "Searching..." : "Search Flights"}
              </button>
            </form>
          )}

          {/* Autocomplete dropdown options */}
          <datalist id="cities">
            {cities.map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>
        </div>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {/* 🔹 Results */}
        <div className="space-y-4">
          {results.length === 0 && !loading && (
            <p className="text-gray-500">
              No {activeTab}s found yet. Try searching.
            </p>
          )}

          {results.map((trip: any) => (
            <div
              key={trip.id}
              className="p-4 bg-white rounded-lg shadow flex justify-between items-center hover:shadow-md transition"
            >
              <div>
                <p className="font-semibold text-gray-800">
                  {trip.from_city} → {trip.to_city}
                </p>
                <p className="text-sm text-gray-600">
                  {trip.date} • {trip.time}
                </p>

                {trip.operator?.company_name && (
                  <p className="text-sm text-gray-700 mt-2 font-semibold">
                    {trip.operator.company_name}
                  </p>
                )}

                <p className="text-sm mt-1 text-gray-600">
                  {trip.seats_available} seats available
                </p>
              </div>

              <div className="text-right">
                <p className="font-bold text-gray-800">${trip.price}</p>
                <a
                  href={`/traveler/confirm/${trip.id}`}
                  className="bg-green-600 text-white px-3 py-2 rounded inline-block mt-2 hover:bg-green-700 transition"
                >
                  Select
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


