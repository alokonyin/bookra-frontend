import React, { useEffect, useState } from "react";
import { fetchOperatorDashboard } from "@/api/operator";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOperatorDashboard()
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!data) return <p>Loading dashboard...</p>;

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
