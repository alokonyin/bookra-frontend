// frontend/api/operator.js
const API_URL = "http://127.0.0.1:8000/v1/operator";

// 🪪 Retrieve token (operator or traveler)
function getToken() {
  return localStorage.getItem("safar_token") || localStorage.getItem("token");
}

// 📊 Operator Dashboard
export async function fetchOperatorDashboard() {
  const token = getToken();
  if (!token) throw new Error("Missing authentication token");

  const res = await fetch(`${API_URL}/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to load dashboard");
  }

  return res.json();
}

// 🚌 Create a new trip
export async function createTrip(data) {
  const token = getToken();
  const res = await fetch(`${API_URL}/trips`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to create trip");
  }

  return res.json();
}

// 🧾 Get all operator trips
export async function getTrips() {
  const token = getToken();
  const res = await fetch(`${API_URL}/trips`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to load trips");
  }

  return res.json();
}

// 💳 Payment method info
export async function getPaymentMethod() {
  const token = getToken();
  const res = await fetch(`${API_URL}/payment-method`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to load payment method");
  }

  return res.json();
}

// 💰 Save payment method
export async function savePaymentMethod(data) {
  const token = getToken();
  const res = await fetch(`${API_URL}/payment-method`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to save payment method");
  }

  return res.json();
}

// 📋 Get all operator bookings
export async function getOperatorBookings() {
  const token = getToken();
  const res = await fetch(`${API_URL}/bookings`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to load bookings");
  }

  return res.json();
}
