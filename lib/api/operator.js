const API_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/v1/operator`;

function getToken() {
  return (
    typeof window !== "undefined" &&
    (localStorage.getItem("safar_token") || localStorage.getItem("token"))
  );
}

export async function fetchOperatorDashboard() {
  const token = getToken();
  if (!token) throw new Error("Missing authentication token");

  console.log("📡 Fetching operator dashboard with token", token);

  const res = await fetch(`${API_URL}/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to load dashboard");
  }

  return res.json();
}
