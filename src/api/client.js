// frontend/src/api/client.js
const API_BASE_URL = "http://127.0.0.1:8000";

function getToken() {
  return localStorage.getItem("token");
}

export async function apiRequest(path, method = "GET", body = null) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || "Request failed");
  return data;
}

// traveler-specific helpers
export const travelerAPI = {
  getTrips: () => apiRequest("/v1/trips"),
  getMyBookings: () => apiRequest("/v1/bookings/me"),
};
