"use client";
import { useEffect, useState } from "react";
import {
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Calendar
} from "lucide-react";

interface OperatorApplication {
  id: number;
  company_name: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  business_registration_number: string;
  country: string;
  city: string;
  address: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export default function OperatorApplicationsPage() {
  const [applications, setApplications] = useState<OperatorApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<OperatorApplication[]>([]);
  const [filter, setFilter] = useState<string>("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<OperatorApplication | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [initialPassword, setInitialPassword] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    if (filter === "all") {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(applications.filter((app) => app.status === filter));
    }
  }, [applications, filter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || localStorage.getItem("bookra_token");
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const res = await fetch(`${API_BASE}/v1/admin/operator-applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch applications");
      }

      const data = await res.json();
      setApplications(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openApproveModal = (app: OperatorApplication) => {
    setSelectedApp(app);
    setActionType("approve");
    setAdminNotes("");
    setInitialPassword("");
    setShowModal(true);
  };

  const openRejectModal = (app: OperatorApplication) => {
    setSelectedApp(app);
    setActionType("reject");
    setAdminNotes("");
    setShowModal(true);
  };

  const handleApprove = async () => {
    if (!selectedApp) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem("token") || localStorage.getItem("bookra_token");
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const res = await fetch(
        `${API_BASE}/v1/admin/operator-applications/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            application_id: selectedApp.id,
            admin_notes: adminNotes,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to approve application");
      }

      alert(`✅ ${data.message}\n\nPhone: ${data.phone}\nOTP Sent: ${data.otp_sent ? "Yes" : "No"}\n\nThe operator will receive an OTP to set up their account.`);
      setShowModal(false);
      fetchApplications();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApp) return;

    if (!adminNotes.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem("token") || localStorage.getItem("bookra_token");
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const res = await fetch(
        `${API_BASE}/v1/admin/operator-applications/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            application_id: selectedApp.id,
            admin_notes: adminNotes,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to reject application");
      }

      alert(`✅ ${data.message}`);
      setShowModal(false);
      fetchApplications();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: {
        badge: "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200",
        icon: <Clock className="w-4 h-4" />,
      },
      approved: {
        badge: "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200",
        icon: <CheckCircle className="w-4 h-4" />,
      },
      rejected: {
        badge: "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200",
        icon: <XCircle className="w-4 h-4" />,
      },
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-indigo-600 font-medium">Loading applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
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

  const stats = {
    pending: applications.filter((a) => a.status === "pending").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-xl shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Operator Applications
              </h1>
              <p className="text-gray-600 mt-1">Review and manage operator applications</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total</p>
                <p className="text-3xl font-bold text-gray-800">{applications.length}</p>
              </div>
              <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-yellow-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-yellow-700">{stats.pending}</p>
              </div>
              <div className="bg-gradient-to-r from-yellow-100 to-amber-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Approved</p>
                <p className="text-3xl font-bold text-green-700">{stats.approved}</p>
              </div>
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-red-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">Rejected</p>
                <p className="text-3xl font-bold text-red-700">{stats.rejected}</p>
              </div>
              <div className="bg-gradient-to-r from-red-100 to-rose-100 p-3 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setFilter("pending")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md ${
              filter === "pending"
                ? "bg-gradient-to-r from-yellow-400 to-amber-400 text-white scale-105 shadow-lg"
                : "bg-white text-gray-700 hover:shadow-lg hover:scale-105"
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Pending ({stats.pending})</span>
            </div>
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md ${
              filter === "approved"
                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white scale-105 shadow-lg"
                : "bg-white text-gray-700 hover:shadow-lg hover:scale-105"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Approved ({stats.approved})</span>
            </div>
          </button>
          <button
            onClick={() => setFilter("rejected")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md ${
              filter === "rejected"
                ? "bg-gradient-to-r from-red-500 to-rose-500 text-white scale-105 shadow-lg"
                : "bg-white text-gray-700 hover:shadow-lg hover:scale-105"
            }`}
          >
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              <span>Rejected ({stats.rejected})</span>
            </div>
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md ${
              filter === "all"
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white scale-105 shadow-lg"
                : "bg-white text-gray-700 hover:shadow-lg hover:scale-105"
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>All ({applications.length})</span>
            </div>
          </button>
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center shadow-md">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">
              No {filter !== "all" ? filter : ""} applications found
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredApplications.map((app) => {
              const statusConfig = getStatusConfig(app.status);
              return (
                <div
                  key={app.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
                >
                  {/* Application Header */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 border-b border-gray-100">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-xl shadow-md">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-800 mb-1">{app.company_name}</h3>
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{app.city}, {app.country}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${statusConfig.badge} shadow-sm`}>
                        {statusConfig.icon}
                        <span className="font-semibold text-sm uppercase">{app.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Application Details */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg mt-1">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Contact Person</p>
                          <p className="text-gray-900 font-medium text-lg">{app.contact_name}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="bg-green-100 p-2 rounded-lg mt-1">
                          <Phone className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Phone</p>
                          <p className="text-gray-900 font-medium text-lg">{app.contact_phone}</p>
                        </div>
                      </div>

                      {app.contact_email && (
                        <div className="flex items-start gap-3">
                          <div className="bg-purple-100 p-2 rounded-lg mt-1">
                            <Mail className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Email</p>
                            <p className="text-gray-900 font-medium text-lg">{app.contact_email}</p>
                          </div>
                        </div>
                      )}

                      {app.business_registration_number && (
                        <div className="flex items-start gap-3">
                          <div className="bg-orange-100 p-2 rounded-lg mt-1">
                            <FileText className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Business Reg. No.</p>
                            <p className="text-gray-900 font-medium text-lg">{app.business_registration_number}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {app.address && (
                      <div className="mb-6 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-gray-600 mt-1" />
                          <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Address</p>
                            <p className="text-gray-900 font-medium">{app.address}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {app.description && (
                      <div className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100">
                        <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-2">Description</p>
                        <p className="text-gray-700 leading-relaxed">{app.description}</p>
                      </div>
                    )}

                    {app.admin_notes && (
                      <div className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                        <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">Admin Notes</p>
                        <p className="text-blue-900">{app.admin_notes}</p>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <p className="text-sm">
                          Applied: {new Date(app.created_at).toLocaleDateString()}
                          {app.reviewed_at &&
                            ` • Reviewed: ${new Date(app.reviewed_at).toLocaleDateString()}`}
                        </p>
                      </div>

                      {app.status === "pending" && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => openRejectModal(app)}
                            className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg font-semibold hover:from-red-600 hover:to-rose-600 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                          <button
                            onClick={() => openApproveModal(app)}
                            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-3 rounded-xl ${
                actionType === "approve"
                  ? "bg-gradient-to-r from-green-100 to-emerald-100"
                  : "bg-gradient-to-r from-red-100 to-rose-100"
              }`}>
                {actionType === "approve" ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                {actionType === "approve" ? "Approve" : "Reject"} Application
              </h2>
            </div>

            <div className="mb-6 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Company</p>
              <p className="text-lg font-bold text-gray-800">{selectedApp.company_name}</p>
            </div>

            {actionType === "approve" && (
              <div className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <p className="text-sm font-semibold text-blue-900">Password Setup Process</p>
                </div>
                <p className="text-xs text-blue-700 leading-relaxed">
                  After approval, an OTP will be sent to the operator's phone. They will use this OTP to set their own password at: <strong>/operator/setup-password</strong>
                </p>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                {actionType === "reject" ? "Reason for Rejection" : "Admin Notes"}{" "}
                {actionType === "reject" && <span className="text-red-500">*</span>}
              </label>
              <textarea
                placeholder={
                  actionType === "reject"
                    ? "Provide a reason for rejection..."
                    : "Optional notes..."
                }
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[120px] resize-none"
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={actionType === "approve" ? handleApprove : handleReject}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 shadow-md hover:shadow-lg ${
                  actionType === "approve"
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    : "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600"
                }`}
                disabled={actionLoading}
              >
                {actionLoading
                  ? "Processing..."
                  : actionType === "approve"
                  ? "Approve"
                  : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
