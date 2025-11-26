// frontend/api/bookings.js
const API_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/v1/traveler/bookings`;

function getToken() {
  return localStorage.getItem("safar_token") || localStorage.getItem("token");
}

// 🧾 Create a new booking
export async function createBooking(data) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to create booking");
  }

  return res.json();
}
