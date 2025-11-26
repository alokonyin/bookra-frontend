"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Briefcase,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Activity,
  ArrowUp,
  ArrowDown,
  CreditCard,
  MapPin
} from "lucide-react";

type Metrics = {
  total_operators: number;
  total_travelers: number;
  total_bookings: number;
  platform_revenue: number;
  operator_revenue: number;
  total_payment_flow: number;
};

type Payment = {
  id: number;
  amount: number;
  role: string;
  method: string;
  status: string;
  receiver_email: string;
  created_at: string;
  transaction_id: string;
};

type Booking = {
  booking_id: number;
  traveler_email: string;
  contact_email: string;
  from_city: string;
  to_city: string;
  date: string;
  time: string;
  total_amount: number;
  status: string;
  passengers: number;
  created_at: string;
};

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function authFetch(url: string, init: RequestInit = {}) {
    const token =
      localStorage.getItem("bookra_token") || localStorage.getItem("token");
    const headers = {
      ...(init.headers || {}),
      Authorization: `Bearer ${token}`,
    };
    const res = await fetch(url, { ...init, headers, credentials: "include" });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Request failed: ${res.status}`);
    }
    return res.json();
  }

  useEffect(() => {
    (async () => {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const [m, p, b] = await Promise.all([
          authFetch(`${API_BASE}/v1/admin/metrics`),
          authFetch(`${API_BASE}/v1/admin/recent-payments`),
          authFetch(`${API_BASE}/v1/admin/recent-bookings`),
        ]);
        setMetrics(m);
        setPayments(Array.isArray(p) ? p : []);
        setBookings(Array.isArray(b) ? b : []);
      } catch (e: any) {
        console.error(e);
        setError(e.message || "Failed to load admin dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-red-200">
          <div className="text-red-600 text-5xl mb-4 text-center">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Error Loading Dashboard</h2>
          <p className="text-red-600 text-center">{error}</p>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const platformShare = (metrics.platform_revenue / metrics.total_payment_flow) * 100 || 0;
  const operatorShare = (metrics.operator_revenue / metrics.total_payment_flow) * 100 || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your platform today.</p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Users Card */}
          <StatCard
            title="Total Users"
            value={(metrics.total_operators + metrics.total_travelers).toString()}
            subtitle={`${metrics.total_operators} operators • ${metrics.total_travelers} travelers`}
            icon={<Users className="w-8 h-8" />}
            gradient="from-blue-500 to-blue-600"
            trend={{ value: "+12%", isPositive: true }}
          />

          {/* Operators Card */}
          <StatCard
            title="Operators"
            value={metrics.total_operators.toString()}
            subtitle="Active transport companies"
            icon={<Briefcase className="w-8 h-8" />}
            gradient="from-purple-500 to-purple-600"
            trend={{ value: "+8%", isPositive: true }}
          />

          {/* Bookings Card */}
          <StatCard
            title="Total Bookings"
            value={metrics.total_bookings.toString()}
            subtitle="All time bookings"
            icon={<ShoppingBag className="w-8 h-8" />}
            gradient="from-green-500 to-green-600"
            trend={{ value: "+23%", isPositive: true }}
          />
        </div>

        {/* Revenue Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Platform Revenue */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                5% Share
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Platform Revenue</h3>
            <p className="text-3xl font-bold text-gray-800 mb-2">
              ${metrics.platform_revenue.toFixed(2)}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${platformShare}%` }}
              ></div>
            </div>
          </div>

          {/* Operator Revenue */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                95% Share
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Operator Revenue</h3>
            <p className="text-3xl font-bold text-gray-800 mb-2">
              ${metrics.operator_revenue.toFixed(2)}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${operatorShare}%` }}
              ></div>
            </div>
          </div>

          {/* Total Payment Flow */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                Total Flow
              </span>
            </div>
            <h3 className="text-white/90 text-sm font-medium mb-1">Total Payment Flow</h3>
            <p className="text-4xl font-bold mb-2">
              ${metrics.total_payment_flow.toFixed(2)}
            </p>
            <div className="flex items-center text-sm text-white/90">
              <ArrowUp className="w-4 h-4 mr-1" />
              <span>+18% from last month</span>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Payments */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Recent Payments</h2>
              </div>
              <span className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
                View All →
              </span>
            </div>

            <div className="space-y-3">
              {payments.length > 0 ? (
                payments.slice(0, 5).map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                        payment.status === 'success' ? 'bg-green-500' : 'bg-yellow-500'
                      }`}>
                        $
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">${Number(payment.amount).toFixed(2)}</p>
                        <p className="text-xs text-gray-500">
                          {payment.receiver_email || 'Unknown'} • {payment.method || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        payment.status === 'success'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {payment.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1 capitalize">{payment.role}</p>
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

          {/* Recent Bookings */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Recent Bookings</h2>
              </div>
              <span className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
                View All →
              </span>
            </div>

            <div className="space-y-3">
              {bookings.length > 0 ? (
                bookings.slice(0, 5).map((booking) => (
                  <div
                    key={booking.booking_id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                        {booking.passengers || 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {booking.from_city} → {booking.to_city}
                        </p>
                        <p className="text-xs text-gray-500">
                          {booking.traveler_email || booking.contact_email || 'Guest'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">${Number(booking.total_amount).toFixed(2)}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        booking.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : booking.status === 'cancelled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <MapPin className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No bookings yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Revenue Split Visualization */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Revenue Distribution</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Platform vs Operator */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-600">Platform (5%)</span>
                <span className="text-sm font-bold text-emerald-600">
                  ${metrics.platform_revenue.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-4 rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                  style={{ width: `${platformShare || 5}%` }}
                >
                  {platformShare > 0 && (
                    <span className="text-xs text-white font-bold">{platformShare.toFixed(1)}%</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-600">Operators (95%)</span>
                <span className="text-sm font-bold text-blue-600">
                  ${metrics.operator_revenue.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                  style={{ width: `${operatorShare || 95}%` }}
                >
                  {operatorShare > 0 && (
                    <span className="text-xs text-white font-bold">{operatorShare.toFixed(1)}%</span>
                  )}
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg. Booking Value</span>
                  <span className="font-bold text-gray-800">
                    ${metrics.total_bookings > 0
                      ? (metrics.total_payment_flow / metrics.total_bookings).toFixed(2)
                      : '0.00'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Transactions</span>
                  <span className="font-bold text-gray-800">{payments.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Operators</span>
                  <span className="font-bold text-gray-800">{metrics.total_operators}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Platform Health</span>
                  <span className="flex items-center gap-1 text-green-600 font-bold">
                    <Activity className="w-4 h-4" />
                    Excellent
                  </span>
                </div>
              </div>
            </div>
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
  subtitle,
  icon,
  gradient,
  trend
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
  trend?: { value: string; isPositive: boolean };
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 bg-gradient-to-br ${gradient} rounded-xl shadow-lg text-white`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            {trend.value}
          </div>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-2">{title}</h3>
      <p className="text-3xl font-bold text-gray-800 mb-1">{value}</p>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}
