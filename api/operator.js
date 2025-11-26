// frontend/api/operator.js
const API_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/v1/operator`;

// Prefer the app-wide key, fall back to legacy
function getToken() {
  return (
    localStorage.getItem("safar_token") ||
    localStorage.getItem("token") ||
    ""
  );
}

async function request(path, options = {}) {
  const token = getToken();
  if (!token) throw new Error("Missing authentication token");

  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    let detail = "Request failed";
    try {
      const j = await res.json();
      detail = j.detail || JSON.stringify(j);
    } catch {}
    throw new Error(detail);
  }
  return res.json();
}

// ---- exported helpers ----
export function fetchOperatorDashboard() {
  return request("/dashboard");
}

export function createTrip(data) {
  return request("/trips", { method: "POST", body: JSON.stringify(data) });
}

export function getTrips() {
  return request("/trips");
}

export function getPaymentMethod() {
  return request("/payment-method");
}

export function savePaymentMethod(data) {
  return request("/payment-method", { method: "POST", body: JSON.stringify(data) });
}

export function getOperatorBookings() {
  return request("/bookings");
}
