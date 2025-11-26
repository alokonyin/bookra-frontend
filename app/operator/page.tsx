"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Bus,
  Users,
  DollarSign,
  TrendingUp,
  MapPin,
  Calendar,
  CreditCard,
  ArrowUp,
  CheckCircle,
  Clock,
  XCircle,
  Activity
} from "lucide-react";

export default function OperatorDashboard() {
  const [stats, setStats] = useState<any>({
    total_trips: 0,
    total_bookings: 0,
    seats_sold: 0,
    revenue: 0,
    recent_payments: [],
    offices: [],
    total_offices: 0,
  });

  const [bookings, setBookings] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const token =
        localStorage.getItem("bookra_token") || localStorage.getItem("token");
      if (!token) {
        window.location.href = "/signin";
        return;
      }

      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}";
      const headers = { Authorization: `Bearer ${token}` };

      const statsRes = await fetch(
        `${API_BASE}/v1/operator/dashboard`,
        { headers }
      );
      if (!statsRes.ok) {
        const msg = await statsRes.text();
        throw new Error(`Dashboard error: ${msg}`);
      }
      const statsData = await statsRes.json();

      const bookingsRes = await fetch(
        `${API_BASE}/v1/operator/bookings`,
        { headers }
      );
      if (!bookingsRes.ok) {
        const msg = await bookingsRes.text();
        throw new Error(`Bookings error: ${msg}`);
      }
      const bookingsData = await bookingsRes.json();

      setStats(statsData);
      setBookings(bookingsData);
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to load operator dashboard. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-red-200">
          <div className="text-red-600 text-5xl mb-4 text-center">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Error Loading Dashboard</h2>
          <p className="text-red-600 text-center">{error}</p>
        </div>
      </div>
    );
  }

  // Calculate some derived stats
  const avgRevenuePerOffice = stats.total_offices > 0
    ? (stats.revenue / stats.total_offices).toFixed(2)
    : '0.00';
  const avgSeatsPerTrip = stats.total_trips > 0
    ? Math.round(stats.seats_sold / stats.total_trips)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Operator Dashboard</h1>
            <p className="text-gray-600">Monitor your transport operations and performance</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <a
              href="/operator/trips"
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Manage Trips
            </a>
            <a
              href="/operator/offices"
              className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-lg border border-indigo-200"
            >
              Manage Offices
            </a>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Offices"
            value={stats.total_offices || 0}
            icon={<Building2 className="w-7 h-7" />}
            gradient="from-blue-500 to-blue-600"
            trend="+2 this month"
          />
          <StatCard
            title="Total Trips"
            value={stats.total_trips}
            icon={<Bus className="w-7 h-7" />}
            gradient="from-purple-500 to-purple-600"
            trend="+45 this week"
          />
          <StatCard
            title="Seats Sold"
            value={stats.seats_sold}
            icon={<Users className="w-7 h-7" />}
            gradient="from-pink-500 to-pink-600"
            trend={`${avgSeatsPerTrip} avg/trip`}
          />
          <StatCard
            title="Revenue (95%)"
            value={`$${Number(stats.revenue || 0).toFixed(2)}`}
            icon={<DollarSign className="w-7 h-7" />}
            gradient="from-green-500 to-emerald-600"
            trend="+18% growth"
            highlight
          />
        </div>

        {/* Office Performance */}
        {stats.offices && stats.offices.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Office Performance</h2>
                  <p className="text-sm text-gray-500">Track each office's contribution</p>
                </div>
              </div>
              <a
                href="/operator/offices"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
              >
                Manage Offices →
              </a>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {stats.offices.map((office: any, idx: number) => (
                <div
                  key={`office-${office.office_id || idx}`}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{office.office_name}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {office.city}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        office.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {office.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-indigo-600">{office.trips}</p>
                      <p className="text-xs text-gray-500">Trips</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{office.bookings}</p>
                      <p className="text-xs text-gray-500">Bookings</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        ${Number(office.revenue || 0).toFixed(0)}
                      </p>
                      <p className="text-xs text-gray-500">Revenue</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Office Performance Summary */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-sm text-blue-600 font-medium mb-1">Avg Revenue/Office</p>
                <p className="text-2xl font-bold text-blue-700">${avgRevenuePerOffice}</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                <p className="text-sm text-purple-600 font-medium mb-1">Total Bookings</p>
                <p className="text-2xl font-bold text-purple-700">{stats.total_bookings}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <p className="text-sm text-green-600 font-medium mb-1">Best Performer</p>
                <p className="text-lg font-bold text-green-700">
                  {stats.offices.reduce((max: any, office: any) =>
                    office.revenue > (max?.revenue || 0) ? office : max
                  , stats.offices[0])?.office_name || "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Recent Bookings</h2>
                  <p className="text-xs text-gray-500">Latest customer reservations</p>
                </div>
              </div>
              <a href="/operator/bookings" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                View All →
              </a>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {bookings.length > 0 ? (
                bookings.slice(0, 6).map((booking, idx) => (
                  <div
                    key={`booking-${booking.id || idx}`}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                        {booking.seat_numbers?.length || booking.passengers || 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {booking.trip_details
                            ? `${booking.trip_details.from_city || "?"} → ${booking.trip_details.to_city || "?"}`
                            : `${booking.from_city || "?"} → ${booking.to_city || "?"}`}
                        </p>
                        <p className="text-xs text-gray-500">{booking.traveler_email || "Guest"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800 text-sm">${Number(booking.total_amount || 0).toFixed(2)}</p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${
                          booking.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : booking.status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {booking.status === "completed" && <CheckCircle className="w-3 h-3" />}
                        {booking.status === "cancelled" && <XCircle className="w-3 h-3" />}
                        {booking.status === "pending" && <Clock className="w-3 h-3" />}
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Calendar className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No bookings yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Payments */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Recent Payments</h2>
                  <p className="text-xs text-gray-500">Your earnings breakdown</p>
                </div>
              </div>
              <span className="text-sm text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer">
                View All →
              </span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {stats.recent_payments?.length > 0 ? (
                stats.recent_payments.slice(0, 6).map((payment: any, idx: number) => (
                  <div
                    key={`payment-${payment.id || idx}`}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                        payment.status === 'success' ? 'bg-green-500' : 'bg-yellow-500'
                      }`}>
                        $
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">${Number(payment.amount || 0).toFixed(2)}</p>
                        <p className="text-xs text-gray-500">{payment.method || "N/A"} • ID: {payment.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          payment.status === "success"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {payment.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {payment.created_at
                          ? new Date(payment.created_at).toLocaleDateString()
                          : "—"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <CreditCard className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No payments yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/operator/trips"
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-colors border border-white/20"
            >
              <Bus className="w-8 h-8 mb-2" />
              <h3 className="font-semibold mb-1">Create New Trip</h3>
              <p className="text-sm text-white/80">Add a new route and schedule</p>
            </a>
            <a
              href="/operator/offices"
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-colors border border-white/20"
            >
              <Building2 className="w-8 h-8 mb-2" />
              <h3 className="font-semibold mb-1">Manage Offices</h3>
              <p className="text-sm text-white/80">View and edit office locations</p>
            </a>
            <a
              href="/operator/profile"
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-colors border border-white/20"
            >
              <Activity className="w-8 h-8 mb-2" />
              <h3 className="font-semibold mb-1">View Analytics</h3>
              <p className="text-sm text-white/80">Detailed performance reports</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Stat Card Component
function StatCard({
  title,
  value,
  icon,
  gradient,
  trend,
  highlight = false
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
  trend?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
      highlight ? 'ring-2 ring-green-400' : ''
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 bg-gradient-to-br ${gradient} rounded-xl shadow-lg text-white`}>
          {icon}
        </div>
        {highlight && (
          <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
            <TrendingUp className="w-4 h-4" />
          </div>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-2">{title}</h3>
      <p className="text-3xl font-bold text-gray-800 mb-1">{value}</p>
      {trend && (
        <p className="text-sm text-gray-500 flex items-center gap-1">
          <ArrowUp className="w-3 h-3 text-green-600" />
          {trend}
        </p>
      )}
    </div>
  );
}
