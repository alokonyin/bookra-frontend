"use client";

import { useEffect, useState } from "react";

interface Booking {
  id: number;
  trip_id: number;
  passengers: number;
  total_amount: number;
  status: string;
  seat_numbers: string[];
  created_at: string;
  trip: {
    from_city: string;
    to_city: string;
    date: string;
    time: string;
  };
}

export default function MyTripsPage() {
  const [bookingsByTrip, setBookingsByTrip] = useState<Record<string, Booking[]>>({});
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token =
          localStorage.getItem("bookra_token") || localStorage.getItem("token");

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/v1/traveler/bookings/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || "Failed to load bookings");
        }

        const data: Booking[] = await res.json();

        // Group bookings by unique trip (route + date + time)
        const grouped: Record<string, Booking[]> = {};
        data.forEach((booking) => {
          if (booking.trip) {
            const tripKey = `${booking.trip.from_city} → ${booking.trip.to_city}|${booking.trip.date}|${booking.trip.time}|${booking.trip_id}`;
            if (!grouped[tripKey]) grouped[tripKey] = [];
            grouped[tripKey].push(booking);
          }
        });

        setBookingsByTrip(grouped);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading your trips...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (Object.keys(bookingsByTrip).length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-2">No trips booked yet</p>
          <p className="text-gray-400">Your bookings will appear here once you book a trip</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Trips</h1>
          <p className="text-gray-600 mt-1">View all your bookings organized by trip</p>
        </div>

        <div className="space-y-4">
          {Object.entries(bookingsByTrip).map(([tripKey, tripBookings]) => {
            const firstBooking = tripBookings[0];
            const totalAmount = tripBookings.reduce((sum, b) => sum + b.total_amount, 0);

            return (
              <div key={tripKey} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Trip Header */}
                <div
                  className="bg-gradient-to-r from-green-50 to-teal-50 p-4 cursor-pointer hover:from-green-100 hover:to-teal-100 transition-colors"
                  onClick={() => setExpandedTrip(expandedTrip === tripKey ? null : tripKey)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <div className="text-lg font-bold text-gray-900">
                          {firstBooking.trip.from_city}
                        </div>
                        <div className="text-xs text-gray-500 text-center">→</div>
                        <div className="text-lg font-bold text-gray-900">
                          {firstBooking.trip.to_city}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">
                            📅 {new Date(firstBooking.trip.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric"
                            })}
                          </span>
                          <span className="text-sm font-medium text-gray-700">
                            🕐 {firstBooking.trip.time}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {tripBookings.length} booking{tripBookings.length !== 1 ? "s" : ""} • ${totalAmount.toFixed(2)} total
                        </p>
                      </div>
                    </div>
                    <button className="text-teal-600 font-medium px-4 py-2 rounded-lg hover:bg-teal-50 transition-colors">
                      {expandedTrip === tripKey ? "Hide ▲" : "View ▼"}
                    </button>
                  </div>
                </div>

                {/* Booking Details */}
                {expandedTrip === tripKey && (
                  <div className="bg-white">
                    <table className="w-full">
                      <thead className="bg-gray-100 border-t border-b">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seats</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booked On</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {tripBookings.map((booking) => (
                          <tr key={booking.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              #{booking.id}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {booking.seat_numbers?.join(", ") || booking.passengers || "—"}
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                              ${booking.total_amount.toFixed(2)}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  booking.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : booking.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {new Date(booking.created_at).toLocaleDateString("en-US", {
                                month: "numeric",
                                day: "numeric",
                                year: "numeric"
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
