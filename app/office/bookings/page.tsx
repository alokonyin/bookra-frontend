"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface TripDetails {
  id: number;
  from_city: string;
  to_city: string;
  date: string;
  time: string;
}

interface Booking {
  id: number;
  trip_details: TripDetails;
  passengers: number;
  total_amount: number;
  status: string;
  contact_email: string;
  contact_phone: string;
  created_at: string;
}

export default function OfficeBookingsPage() {
  const router = useRouter();
  const [bookingsByTrip, setBookingsByTrip] = useState<Record<string, Booking[]>>({});
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("bookra_token");
    localStorage.removeItem("bookra_user");
    localStorage.removeItem("office_role");
    router.push("/signin");
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("bookra_token");
      if (!token) {
        router.push("/signin");
        return;
      }

      const res = await fetch("http://127.0.0.1:8000/v1/operator/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || "Failed to load bookings");
        return;
      }

      const data: Booking[] = await res.json();

      // Group bookings by unique trip (including time)
      const grouped: Record<string, Booking[]> = {};
      data.forEach((b: Booking) => {
        const tripKey = `${b.trip_details?.from_city} → ${b.trip_details?.to_city}|${b.trip_details?.date}|${b.trip_details?.time}|${b.trip_details?.id}`;
        if (!grouped[tripKey]) grouped[tripKey] = [];
        grouped[tripKey].push(b);
      });

      setBookingsByTrip(grouped);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError("An error occurred while loading bookings");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading bookings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
            <p className="text-gray-600 mt-1">View all bookings organized by trip</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/office/dashboard")}
              className="bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 border border-gray-300"
            >
              ← Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Bookings Grouped by Trip */}
        {Object.keys(bookingsByTrip).length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg">No bookings found</p>
            <p className="text-gray-400 text-sm mt-1">Bookings will appear here once travelers book your trips</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(bookingsByTrip).map(([tripKey, tripBookings]) => {
              const firstBooking = tripBookings[0];
              const tripDetails = firstBooking.trip_details;

              return (
                <div key={tripKey} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  {/* Trip Header */}
                  <div
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-colors"
                    onClick={() => setExpandedTrip(expandedTrip === tripKey ? null : tripKey)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <div className="text-lg font-bold text-gray-900">
                            {tripDetails?.from_city}
                          </div>
                          <div className="text-xs text-gray-500 text-center">→</div>
                          <div className="text-lg font-bold text-gray-900">
                            {tripDetails?.to_city}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">
                              📅 {tripDetails?.date && new Date(tripDetails.date).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric"
                              })}
                            </span>
                            <span className="text-sm font-medium text-gray-700">
                              🕐 {tripDetails?.time}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {tripBookings.length} booking{tripBookings.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <button className="text-indigo-600 font-medium px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors">
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Passengers</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {tripBookings.map((booking) => (
                            <tr key={booking.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                #{booking.id}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                {booking.contact_email && <div>{booking.contact_email}</div>}
                                {booking.contact_phone && <div className="text-gray-500">{booking.contact_phone}</div>}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {booking.passengers}
                              </td>
                              <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                KES {booking.total_amount.toLocaleString()}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    booking.status === "completed"
                                      ? "bg-green-100 text-green-800"
                                      : booking.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </span>
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
        )}
      </div>
    </div>
  );
}
