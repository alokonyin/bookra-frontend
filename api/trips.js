// frontend/api/trips.js
const API_URL = "http://127.0.0.1:8000/v1/traveler";

export async function searchTrips(params) {
  const token = localStorage.getItem("safar_token") || localStorage.getItem("token");

  const url = new URL(`${API_URL}/search`);
  url.search = new URLSearchParams({
    from_city: params.from_city,
    to_city: params.to_city,
    date: params.date,
    mode: "bus",
  }).toString();

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to search trips");
  }

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}
