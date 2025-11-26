import { useEffect, useState } from "react";
import { travelerAPI } from "../../api/client";

export default function TravelerDashboard() {
  const [trips, setTrips] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [t, b] = await Promise.all([
          travelerAPI.getTrips(),
          travelerAPI.getMyBookings(),
        ]);
        setTrips(t);
        setBookings(b);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <p>Loading your dashboard...</p>;
  if (error) return <p style={{ color: "red" }}>⚠️ {error}</p>;

  return (
    <div className="dashboard">
      <h2>Traveler Dashboard</h2>

      <section className="trips">
        <h3>Available Trips</h3>
        {trips.length === 0 ? (
          <p>No trips found.</p>
        ) : (
          <ul>
            {trips.map((trip) => (
              <li key={trip.id}>
                {trip.from_city} → {trip.to_city} on {trip.date} at{" "}
                {trip.time} — ${trip.price}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bookings">
        <h3>My Bookings</h3>
        {bookings.length === 0 ? (
          <p>You haven’t made any bookings yet.</p>
        ) : (
          <ul>
            {bookings.map((b) => (
              <li key={b.id}>
                Trip #{b.trip_id} — {b.status} — {b.total_amount} USD
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
