import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiRequest } from "../../api/client";

export default function ConfirmBooking() {
  const { state } = useLocation();
  const trip = state?.trip;
  const navigate = useNavigate();

  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);

  // Fetch booked seats for trip
  useEffect(() => {
    async function loadBookedSeats() {
      if (!trip?.id) return;
      try {
        const data = await apiRequest(`/v1/trips/${trip.id}`, "GET");
        setBookedSeats(data.booked_seats || []);
      } catch (err) {
        console.error("❌ Failed to fetch booked seats:", err.message);
      }
    }
    loadBookedSeats();
  }, [trip]);

  if (!trip) return <p>No trip selected.</p>;

  const toggleSeat = (seat) => {
    if (bookedSeats.includes(seat)) return; // can't select booked seats
    setSelectedSeats((prev) =>
      prev.includes(seat)
        ? prev.filter((s) => s !== seat)
        : [...prev, seat]
    );
  };

  const total = (trip.price || 0) * (selectedSeats.length || 1);

  async function handleConfirm() {
    if (!contact.name || !contact.email)
      return alert("Please fill contact info");

    setLoading(true);
    try {
      const body = {
        trip_id: trip.id,
        passengers: selectedSeats.length || 1,
        seat_numbers: selectedSeats,
        total_amount: total,
        contact_name: contact.name,
        contact_email: contact.email,
        contact_phone: contact.phone,
      };
      await apiRequest("/v1/bookings/confirm", "POST", body);
      alert("✅ Booking confirmed!");
      navigate("/traveler/bookings");
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  // Seat grid
  const seatRows = 10;
  const seatsPerSide = 3;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* ← Back button */}
      <button
        onClick={() => navigate(-1)}
        className="text-blue-600 hover:underline mb-4"
      >
        ← Back to Search
      </button>

      {/* Trip Info */}
      <h2 className="text-2xl font-bold mb-2">
        {trip.from_city} → {trip.to_city}
      </h2>
      <p className="text-gray-600 mb-1">
        {trip.date} • {trip.time}
      </p>

      {/* Operator Info */}
      {trip.operator && (
        <div className="flex items-center gap-2 mb-4">
          {trip.operator.logo_url && (
            <img
              src={trip.operator.logo_url}
              alt={trip.operator.name}
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="font-medium text-gray-700">
            Operated by {trip.operator.name}
          </span>
        </div>
      )}

      {/* Seat Map Legend */}
      <div className="flex gap-4 text-sm mb-3">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-300 rounded border" /> Available
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-500 rounded border" /> Selected
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-red-400 rounded border" /> Booked
        </div>
      </div>

      {/* Seat Map Grid */}
      <div className="grid grid-cols-[repeat(7,2rem)] gap-2">
        {Array.from({ length: seatRows }).map((_, row) => (
          <div key={row} className="contents">
            {Array.from({ length: seatsPerSide }).map((_, col) => {
              const seat = `${row + 1}${String.fromCharCode(65 + col)}`;
              const isBooked = bookedSeats.includes(seat);
              const isSelected = selectedSeats.includes(seat);
              return (
                <div
                  key={seat}
                  onClick={() => toggleSeat(seat)}
                  className={`w-8 h-8 rounded text-center leading-8 border cursor-pointer transition ${
                    isBooked
                      ? "bg-red-400 text-white cursor-not-allowed"
                      : isSelected
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {seat}
                </div>
              );
            })}
            <div></div>
            {Array.from({ length: seatsPerSide }).map((_, col) => {
              const seat = `${row + 1}${String.fromCharCode(68 + col)}`;
              const isBooked = bookedSeats.includes(seat);
              const isSelected = selectedSeats.includes(seat);
              return (
                <div
                  key={seat}
                  onClick={() => toggleSeat(seat)}
                  className={`w-8 h-8 rounded text-center leading-8 border cursor-pointer transition ${
                    isBooked
                      ? "bg-red-400 text-white cursor-not-allowed"
                      : isSelected
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {seat}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Contact Info */}
      <div className="mt-6 space-y-3">
        <input
          className="w-full border p-2 rounded"
          placeholder="Full name"
          value={contact.name}
          onChange={(e) => setContact({ ...contact, name: e.target.value })}
        />
        <input
          className="w-full border p-2 rounded"
          placeholder="Email"
          value={contact.email}
          onChange={(e) => setContact({ ...contact, email: e.target.value })}
        />
        <input
          className="w-full border p-2 rounded"
          placeholder="Phone"
          value={contact.phone}
          onChange={(e) => setContact({ ...contact, phone: e.target.value })}
        />
      </div>

      {/* Confirm Button */}
      <button
        onClick={handleConfirm}
        disabled={loading}
        className="mt-6 w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading
          ? "Processing..."
          : `Confirm Booking ($${total.toFixed(2)})`}
      </button>
    </div>
  );
}
