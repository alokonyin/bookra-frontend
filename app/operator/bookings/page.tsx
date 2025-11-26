"use client";
import { useEffect, useState } from "react";

interface Office {
  id: number;
  name: string;
}

interface Trip {
  id: number;
  from_city: string;
  to_city: string;
  date: string;
  time: string;
  office: Office;
}

interface Booking {
  id: number;
  traveler_email: string;
  seat_numbers: string[];
  total_amount: number;
  status: string;
  trip_details: Trip;
}

export default function OperatorBookings() {
  const [bookingsByOffice, setBookingsByOffice] = useState<Record<string, Record<string, Booking[]>>>({});
  const [expandedOffice, setExpandedOffice] = useState<string | null>(null);
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    const token = localStorage.getItem("bookra_token");
    const headers = { Authorization: `Bearer ${token}` };

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/v1/operator/bookings`, { headers });
    const data: Booking[] = await res.json();

    // Group by office first, then by unique trip (including time)
    const grouped: Record<string, Record<string, Booking[]>> = {};

    data.forEach((b: Booking) => {
      const officeKey = `${b.trip_details?.office?.name || "Unknown Office"}_${b.trip_details?.office?.id || 0}`;
      const tripKey = `${b.trip_details?.from_city} → ${b.trip_details?.to_city}|${b.trip_details?.date}|${b.trip_details?.time}|${b.trip_details?.id}`;

      if (!grouped[officeKey]) grouped[officeKey] = {};
      if (!grouped[officeKey][tripKey]) grouped[officeKey][tripKey] = [];
      grouped[officeKey][tripKey].push(b);
    });

    setBookingsByOffice(grouped);
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  if (loading) return <div className="p-6">Loading bookings...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Operator Bookings</h1>
          <p className="text-gray-600 mt-1">View all bookings organized by office and trip</p>
        </div>

        {Object.keys(bookingsByOffice).length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg">No bookings yet</p>
            <p className="text-gray-400 text-sm mt-1">Bookings will appear here once travelers book your trips</p>
          </div>
        )}

        <div className="space-y-6">
          {Object.entries(bookingsByOffice).map(([officeKey, trips]) => {
            const officeName = officeKey.split("_")[0];
            const totalBookings = Object.values(trips).reduce((sum, bookings) => sum + bookings.length, 0);

            return (
              <div key={officeKey} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Office Header */}
                <div
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-colors"
                  onClick={() => setExpandedOffice(expandedOffice === officeKey ? null : officeKey)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
                        {officeName.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">{officeName}</h2>
                        <p className="text-sm text-gray-600">
                          {Object.keys(trips).length} trip{Object.keys(trips).length !== 1 ? "s" : ""} • {totalBookings} booking{totalBookings !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <button className="text-blue-600 font-medium px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">
                      {expandedOffice === officeKey ? "Collapse ▲" : "Expand ▼"}
                    </button>
                  </div>
                </div>

                {/* Trips under this office */}
                {expandedOffice === officeKey && (
                  <div className="divide-y divide-gray-200">
                    {Object.entries(trips).map(([tripKey, tripBookings]) => {
                      const firstBooking = tripBookings[0];
                      const tripDetails = firstBooking.trip_details;
                      const tripDisplayKey = `${officeKey}_${tripKey}`;

                      return (
                        <div key={tripKey} className="bg-gray-50">
                          {/* Trip Header */}
                          <div
                            className="p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => setExpandedTrip(expandedTrip === tripDisplayKey ? null : tripDisplayKey)}
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
                                      📅 {new Date(tripDetails?.date).toLocaleDateString("en-US", {
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
                              <button className="text-indigo-600 text-sm font-medium px-3 py-1 rounded hover:bg-indigo-50">
                                {expandedTrip === tripDisplayKey ? "Hide" : "View"}
                              </button>
                            </div>
                          </div>

                          {/* Booking Details */}
                          {expandedTrip === tripDisplayKey && (
                            <div className="bg-white">
                              <table className="w-full">
                                <thead className="bg-gray-100 border-t border-b">
                                  <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Traveler</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seats</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {tripBookings.map((b, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        {b.traveler_email}
                                      </td>
                                      <td className="px-6 py-4 text-sm text-gray-700">
                                        {b.seat_numbers?.join(", ")}
                                      </td>
                                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                        ${b.total_amount.toFixed(2)}
                                      </td>
                                      <td className="px-6 py-4">
                                        <span
                                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            b.status === "completed"
                                              ? "bg-green-100 text-green-800"
                                              : "bg-yellow-100 text-yellow-800"
                                          }`}
                                        >
                                          {b.status}
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
            );
          })}
        </div>
      </div>
    </div>
  );
}


