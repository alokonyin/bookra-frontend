"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bus,
  Plane,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from "lucide-react";

export default function OperatorTripsPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [msgType, setMsgType] = useState<"success" | "error" | null>(null);

  useEffect(() => {
    async function loadTrips() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("http://127.0.0.1:8000/v1/operator/trips", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("bookra_token")}`,
          },
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || "Failed to load trips");
        }
        const data = await res.json();
        setTrips(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    loadTrips();
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this trip?")) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/v1/operator/trips/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("bookra_token")}`,
        },
      });
      if (!res.ok) throw new Error("Failed to delete trip");
      setTrips(trips.filter((t) => t.id !== id));
      setMsg("Trip deleted successfully");
      setMsgType("success");
    } catch (err: any) {
      setMsg(err.message);
      setMsgType("error");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-indigo-600 font-medium">Loading trips...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-700 p-6 rounded-xl shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-6 h-6" />
              <p className="font-bold text-lg">Error</p>
            </div>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const busTrips = trips.filter((t) => t.mode === "bus");
  const flightTrips = trips.filter((t) => t.mode === "flight");

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-xl shadow-lg">
                <Bus className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Manage Trips
                </h1>
                <p className="text-gray-600 mt-1">Create and manage your bus and flight trips</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/operator/trips/new")}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Trip
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Trips</p>
                <p className="text-3xl font-bold text-gray-800">{trips.length}</p>
              </div>
              <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-3 rounded-lg">
                <MapPin className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Bus Trips</p>
                <p className="text-3xl font-bold text-blue-700">{busTrips.length}</p>
              </div>
              <div className="bg-gradient-to-r from-blue-100 to-cyan-100 p-3 rounded-lg">
                <Bus className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Flight Trips</p>
                <p className="text-3xl font-bold text-purple-700">{flightTrips.length}</p>
              </div>
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-3 rounded-lg">
                <Plane className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Message Alert */}
        {msg && (
          <div className={`mb-6 p-4 rounded-xl border ${
            msgType === "success"
              ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-700"
              : "bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-700"
          }`}>
            <div className="flex items-center gap-2">
              {msgType === "success" ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <p className="font-medium">{msg}</p>
            </div>
          </div>
        )}

        {/* Trips Grid */}
        {trips.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center shadow-md">
            <Bus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium mb-2">No trips found</p>
            <p className="text-gray-400 text-sm mb-4">Create your first trip to start accepting bookings</p>
            <button
              onClick={() => router.push("/operator/trips/new")}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-md hover:shadow-lg inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Your First Trip
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {trips.map((t, i) => {
              const isBus = t.mode === "bus";
              const occupancyPercentage = ((t.total_seats - t.seats_available) / t.total_seats) * 100;

              return (
                <div
                  key={t.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
                >
                  {/* Trip Header */}
                  <div className={`${
                    isBus
                      ? "bg-gradient-to-r from-blue-50 to-cyan-50"
                      : "bg-gradient-to-r from-purple-50 to-pink-50"
                  } px-6 py-4 border-b border-gray-100`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`${
                          isBus
                            ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                            : "bg-gradient-to-r from-purple-500 to-pink-500"
                        } p-3 rounded-xl shadow-md`}>
                          {isBus ? (
                            <Bus className="w-6 h-6 text-white" />
                          ) : (
                            <Plane className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-bold text-gray-800">{t.from_city}</h3>
                            <ArrowRight className="w-5 h-5 text-gray-400" />
                            <h3 className="text-xl font-bold text-gray-800">{t.to_city}</h3>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <span className={`px-2 py-1 rounded-md font-medium ${
                              isBus
                                ? "bg-blue-100 text-blue-700"
                                : "bg-purple-100 text-purple-700"
                            }`}>
                              {t.mode.toUpperCase()}
                            </span>
                            <span className="text-gray-600 ml-2">Trip #{i + 1}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/operator/trips/edit/${t.id}`)}
                          className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-amber-400 text-white rounded-lg font-semibold hover:from-yellow-500 hover:to-amber-500 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg font-semibold hover:from-red-600 hover:to-rose-600 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Trip Details */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                      <div className="flex items-start gap-3">
                        <div className="bg-green-100 p-2 rounded-lg mt-1">
                          <Calendar className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Date</p>
                          <p className="text-gray-900 font-medium text-lg">{t.date}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="bg-orange-100 p-2 rounded-lg mt-1">
                          <Clock className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Time</p>
                          <p className="text-gray-900 font-medium text-lg">{t.time}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="bg-emerald-100 p-2 rounded-lg mt-1">
                          <DollarSign className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Price</p>
                          <p className="text-gray-900 font-medium text-lg">${t.price}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="bg-indigo-100 p-2 rounded-lg mt-1">
                          <Users className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Seats</p>
                          <p className="text-gray-900 font-medium text-lg">
                            {t.seats_available}/{t.total_seats}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Occupancy Bar */}
                    <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-gray-700">Seat Occupancy</p>
                        <p className="text-sm font-bold text-gray-800">{occupancyPercentage.toFixed(0)}%</p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-300 ${
                            occupancyPercentage >= 80
                              ? "bg-gradient-to-r from-red-500 to-rose-500"
                              : occupancyPercentage >= 50
                              ? "bg-gradient-to-r from-yellow-400 to-amber-400"
                              : "bg-gradient-to-r from-green-500 to-emerald-500"
                          }`}
                          style={{ width: `${occupancyPercentage}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">
                          {t.total_seats - t.seats_available} booked
                        </p>
                        <p className="text-xs text-gray-500">
                          {t.seats_available} available
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
