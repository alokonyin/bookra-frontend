"use client";

import React, { useState } from "react";
import { searchTrips } from "@/api/trips";
import { createBooking } from "@/api/bookings";

export default function TravelerSearch() {
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<any | null>(null);
  const [form, setForm] = useState({
    passengers: 1,
    contact_name: "",
    contact_email: "",
    contact_phone: "",
  });
  const [msg, setMsg] = useState<string | null>(null);

  // 🔍 Search trips
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const trips = await searchTrips({
        from_city: fromCity,
        to_city: toCity,
        date,
      });

      setResults(Array.isArray(trips) ? trips : []);
    } catch (err: any) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // 🧾 Confirm booking
  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrip) return;
    setMsg(null);
    try {
      const payload = {
        trip_id: selectedTrip.id,
        passengers: form.passengers,
        total_amount: selectedTrip.price * form.passengers,
        seat_numbers: [],
        contact_name: form.contact_name,
        contact_email: form.contact_email,
        contact_phone: form.contact_phone,
      };
      await createBooking(payload);
      setMsg("✅ Booking confirmed! Check your bookings page.");
      setSelectedTrip(null);
    } catch (err: any) {
      setMsg(`❌ ${err.message}`);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Search Trips</h2>

      {/* Search form */}
      <form onSubmit={handleSearch} className="grid grid-cols-3 gap-2 mb-4">
        <input
          value={fromCity}
          onChange={(e) => setFromCity(e.target.value)}
          placeholder="From"
          className="input"
        />
        <input
          value={toCity}
          onChange={(e) => setToCity(e.target.value)}
          placeholder="To"
          className="input"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input"
        />
        <button type="submit" className="btn col-span-3 mt-2">
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <p className="text-red-600">{error}</p>}

      {/* ✅ Results list */}
      {results.length > 0 && (
        <div className="space-y-3 mt-4">
          {results.map((trip) => (
            <div
              key={trip.id}
              className="p-4 bg-white rounded-lg shadow flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">
                  {trip.from_city} → {trip.to_city}
                </p>
                <p className="text-sm text-gray-600">
                  {trip.date} @ {trip.time}
                </p>

                {/* ✅ Operator info */}
                <div className="flex items-center gap-2 mt-1">
                  {trip.operator?.logo_url && (
                    <img
                      src={trip.operator.logo_url}
                      alt={trip.operator.name}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span className="text-sm text-gray-700">
                    {trip.operator?.name || "Operator"}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <p className="font-bold">${trip.price}</p>
                <button
                  onClick={() => setSelectedTrip(trip)}
                  className="btn-sm mt-2 bg-blue-600 text-white rounded px-3 py-1"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🪧 Booking modal */}
      {selectedTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-96">
            <h3 className="text-xl font-semibold mb-2">
              Book: {selectedTrip.from_city} → {selectedTrip.to_city}
            </h3>
            <form onSubmit={handleBooking} className="space-y-3">
              <input
                type="number"
                min={1}
                max={selectedTrip.seats_available}
                value={form.passengers}
                onChange={(e) =>
                  setForm({ ...form, passengers: parseInt(e.target.value) })
                }
                placeholder="Passengers"
                className="input w-full"
              />
              <input
                value={form.contact_name}
                onChange={(e) =>
                  setForm({ ...form, contact_name: e.target.value })
                }
                placeholder="Full Name"
                className="input w-full"
              />
              <input
                value={form.contact_email}
                onChange={(e) =>
                  setForm({ ...form, contact_email: e.target.value })
                }
                placeholder="Email"
                className="input w-full"
              />
              <input
                value={form.contact_phone}
                onChange={(e) =>
                  setForm({ ...form, contact_phone: e.target.value })
                }
                placeholder="Phone"
                className="input w-full"
              />
              <button type="submit" className="btn w-full">
                Confirm Booking
              </button>
              <button
                type="button"
                onClick={() => setSelectedTrip(null)}
                className="btn w-full bg-gray-300"
              >
                Cancel
              </button>
              {msg && <p className="text-center text-sm mt-2">{msg}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
