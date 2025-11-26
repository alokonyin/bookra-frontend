"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Office {
  id: number;
  operator_id: number;
  office_name: string;
  city: string;
  email: string;
  phone: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
}

interface OfficeInvite {
  id: number;
  office_id: number;
  token: string;
  email: string | null;
  expires_at: string;
  used_at: string | null;
  created_by: number;
  created_at: string;
}

export default function OfficesPage() {
  const router = useRouter();
  const [offices, setOffices] = useState<Office[]>([]);
  const [invites, setInvites] = useState<OfficeInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedOfficeId, setSelectedOfficeId] = useState<number | null>(null);

  // Create office form
  const [officeName, setOfficeName] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Invite form
  const [inviteEmail, setInviteEmail] = useState("");
  const [expiresInHours, setExpiresInHours] = useState(72);

  useEffect(() => {
    fetchOffices();
    fetchInvites();
  }, []);

  const fetchOffices = async () => {
    try {
      const token = localStorage.getItem("bookra_token");
      const res = await fetch("http://127.0.0.1:8000/v1/offices/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOffices(data);
    } catch (error) {
      console.error("Error fetching offices:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvites = async () => {
    try {
      const token = localStorage.getItem("bookra_token");
      const res = await fetch("http://127.0.0.1:8000/v1/offices/invites/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setInvites(data);
    } catch (error) {
      console.error("Error fetching invites:", error);
    }
  };

  const handleCreateOffice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("bookra_token");
      const res = await fetch("http://127.0.0.1:8000/v1/offices/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          office_name: officeName,
          city,
          email,
          phone: phone || null,
          address: address || null,
        }),
      });

      if (res.ok) {
        alert("Office created successfully!");
        setShowCreateModal(false);
        resetCreateForm();
        fetchOffices();
      } else {
        const error = await res.json();
        alert(error.detail || "Failed to create office");
      }
    } catch (error) {
      console.error("Error creating office:", error);
      alert("Failed to create office");
    }
  };

  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfficeId) return;

    try {
      const token = localStorage.getItem("bookra_token");
      const res = await fetch("http://127.0.0.1:8000/v1/offices/invites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          office_id: selectedOfficeId,
          email: inviteEmail || null,
          expires_in_hours: expiresInHours,
        }),
      });

      if (res.ok) {
        const invite = await res.json();
        alert("Invite generated successfully!");
        setShowInviteModal(false);
        resetInviteForm();
        fetchInvites();

        // Copy invite link to clipboard
        const inviteLink = `${window.location.origin}/signup/office?token=${invite.token}`;
        navigator.clipboard.writeText(inviteLink);
        alert(`Invite link copied to clipboard:\n${inviteLink}`);
      } else {
        const error = await res.json();
        alert(error.detail || "Failed to generate invite");
      }
    } catch (error) {
      console.error("Error generating invite:", error);
      alert("Failed to generate invite");
    }
  };

  const handleDeactivateOffice = async (officeId: number) => {
    if (!confirm("Are you sure you want to deactivate this office?")) return;

    try {
      const token = localStorage.getItem("bookra_token");
      const res = await fetch(`http://127.0.0.1:8000/v1/offices/${officeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        alert("Office deactivated successfully");
        fetchOffices();
      } else {
        const error = await res.json();
        alert(error.detail || "Failed to deactivate office");
      }
    } catch (error) {
      console.error("Error deactivating office:", error);
      alert("Failed to deactivate office");
    }
  };

  const resetCreateForm = () => {
    setOfficeName("");
    setCity("");
    setEmail("");
    setPhone("");
    setAddress("");
  };

  const resetInviteForm = () => {
    setInviteEmail("");
    setExpiresInHours(72);
    setSelectedOfficeId(null);
  };

  if (loading) {
    return <div className="p-6">Loading offices...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Office Management</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Create Office
        </button>
      </div>

      {/* Offices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {offices.map((office) => (
          <div key={office.id} className="bg-white border rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold">{office.office_name}</h3>
                <p className="text-gray-600">{office.city}</p>
              </div>
              <span
                className={`px-2 py-1 text-xs rounded ${
                  office.is_active
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {office.is_active ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="space-y-2 text-sm mb-4">
              <p><strong>Email:</strong> {office.email}</p>
              {office.phone && <p><strong>Phone:</strong> {office.phone}</p>}
              {office.address && <p><strong>Address:</strong> {office.address}</p>}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedOfficeId(office.id);
                  setShowInviteModal(true);
                }}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
              >
                Generate Invite
              </button>
              {office.is_active && (
                <button
                  onClick={() => handleDeactivateOffice(office.id)}
                  className="px-3 py-2 border border-red-600 text-red-600 rounded text-sm hover:bg-red-50"
                >
                  Deactivate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Invites Section */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Active Invites</h2>
        {invites.length === 0 ? (
          <p className="text-gray-600">No active invites</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Office</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Expires At</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Token</th>
                </tr>
              </thead>
              <tbody>
                {invites.map((invite) => {
                  const office = offices.find((o) => o.id === invite.office_id);
                  return (
                    <tr key={invite.id} className="border-b">
                      <td className="p-2">{office?.office_name || "Unknown"}</td>
                      <td className="p-2">{invite.email || "N/A"}</td>
                      <td className="p-2">
                        {new Date(invite.expires_at).toLocaleDateString()}
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            invite.used_at
                              ? "bg-gray-100 text-gray-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {invite.used_at ? "Used" : "Active"}
                        </span>
                      </td>
                      <td className="p-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {invite.token.substring(0, 8)}...
                        </code>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Office Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Create New Office</h2>
            <form onSubmit={handleCreateOffice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Office Name *
                </label>
                <input
                  type="text"
                  value={officeName}
                  onChange={(e) => setOfficeName(e.target.value)}
                  required
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., Nairobi Branch"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">City *</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., Nairobi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="office@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="+254..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  rows={2}
                  placeholder="Office address"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Create Office
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetCreateForm();
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Generate Office Invite</h2>
            <form onSubmit={handleGenerateInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Office
                </label>
                <p className="text-gray-600">
                  {offices.find((o) => o.id === selectedOfficeId)?.office_name}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="user@example.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Pre-fill the email for the invitee (optional)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Expires In (hours)
                </label>
                <input
                  type="number"
                  value={expiresInHours}
                  onChange={(e) => setExpiresInHours(parseInt(e.target.value))}
                  min={1}
                  max={720}
                  className="w-full border rounded px-3 py-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Default: 72 hours (3 days)
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Generate Invite
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteModal(false);
                    resetInviteForm();
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
