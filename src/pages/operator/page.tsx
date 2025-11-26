// frontend/src/pages/operator/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { fetchOperatorDashboard } from "@/api/operator";

export default function OperatorDashboard() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  console.log("🔍 OperatorDashboard mounted");
  (async () => {
    try {
      const json = await fetchOperatorDashboard();
      console.log("✅ Fetched operator dashboard", json);
      setData(json);
    } catch (e: any) {
      console.error("❌ Failed to fetch dashboard", e);
      setError(e?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  })();
}, []);


  if (loading) return <p style={{ padding: "1rem" }}>Loading dashboard…</p>;
  if (error) {
    return (
      <div style={{ padding: "1rem" }}>
        <p style={{ color: "red" }}>Error: {error}</p>
        <pre style={{ fontSize: 12, opacity: 0.7 }}>
          token in localStorage:
          {" "}
          {typeof window !== "undefined" ? localStorage.getItem("bookra_token") || localStorage.getItem("token") : "(no window)"}
        </pre>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Operator Dashboard</h2>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <h3 className="text-gray-500 text-sm">Total Trips</h3>
          <p className="text-2xl font-bold">{data.total_trips}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h3 className="text-gray-500 text-sm">Total Bookings</h3>
          <p className="text-2xl font-bold">{data.total_bookings}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h3 className="text-gray-500 text-sm">Revenue</h3>
          <p className="text-2xl font-bold">${data.total_revenue}</p>
        </div>
      </div>
    </div>
  );
}


