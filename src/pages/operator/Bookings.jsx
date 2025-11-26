import { useEffect, useState } from "react";
import OperatorNav from "../../components/OperatorNav";
import { getOperatorBookings } from "../../api/operator";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    getOperatorBookings().then(setBookings);
  }, []);

  const filteredBookings =
    filter === "all"
      ? bookings
      : bookings.filter((b) => b.status === filter);

  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  return (
    <div className="p-6">
      <OperatorNav />
      <h1 className="text-xl font-semibold mb-4">Trip Bookings</h1>

      {/* Filter toolbar */}
      <div className="flex gap-3 mb-4">
        {["all", "pending", "completed", "cancelled"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-1 rounded-full border ${
              filter === status
                ? "bg-blue-600 text-white border-blue-600"
                : "text-gray-700 border-gray-300"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <p>No bookings yet.</p>
      ) : (
        <table className="min-w-full text-left border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Trip ID</th>
              <th className="p-2">Traveler</th>
              <th className="p-2">Passengers</th>
              <th className="p-2">Total</th>
              <th className="p-2">Status</th>
              <th className="p-2">Date</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((b) => (
              <>
                <tr key={b.booking_id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{b.trip_id}</td>
                  <td className="p-2">{b.traveler_email}</td>
                  <td className="p-2">{b.passengers}</td>
                  <td className="p-2">${b.total_amount.toFixed(2)}</td>
                  <td
                    className={`p-2 capitalize ${
                      b.status === "completed"
                        ? "text-green-600"
                        : b.status === "pending"
                        ? "text-yellow-600"
                        : "text-gray-600"
                    }`}
                  >
                    {b.status}
                  </td>
                  <td className="p-2">
                    {new Date(b.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-2 text-blue-600 cursor-pointer">
                    <button onClick={() => toggleExpand(b.booking_id)}>
                      {expanded === b.booking_id ? "Hide" : "View"}
                    </button>
                  </td>
                </tr>

                {expanded === b.booking_id && (
                  <tr className="bg-blue-50 border-t">
                    <td colSpan="7" className="p-3">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <p>
                          <strong>From:</strong> {b.trip_details?.from_city}
                        </p>
                        <p>
                          <strong>To:</strong> {b.trip_details?.to_city}
                        </p>
                        <p>
                          <strong>Date:</strong>{" "}
                          {new Date(b.trip_details?.date).toLocaleDateString()}
                        </p>
                        <p>
                          <strong>Time:</strong> {b.trip_details?.time}
                        </p>
                        <p>
                          <strong>Seat Price:</strong> ${b.trip_details?.price}
                        </p>
                        <p>
                          <strong>Seats Left:</strong>{" "}
                          {b.trip_details?.seats_available}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

