"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function TravelerConfirm() {
  const router = useRouter();
  const params = useParams();
  const tripId = Number(params.id);

  const [trip, setTrip] = useState<any>(null);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  // Contact information fields
  const [title, setTitle] = useState("Mr");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [nationality, setNationality] = useState("");
  const [documentType, setDocumentType] = useState("passport");
  const [documentNumber, setDocumentNumber] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<"seats" | "details">("seats");

  // ✅ Fetch trip details + booked seats
  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("bookra_token");
        const headers = { Authorization: `Bearer ${token}` };

        const [tripRes, bookedRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/v1/trips/${tripId}`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/v1/traveler/trips/${tripId}/booked-seats`, { headers }),
        ]);

        if (!tripRes.ok) throw new Error("Trip not found");
        const tripData = await tripRes.json();
        const bookedData = await bookedRes.json();

        setTrip(tripData);
        setBookedSeats(bookedData.booked_seats || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load trip details");
      }
    }
    fetchData();
  }, [tripId]);

  // ✅ Compute total dynamically
  const total = trip ? selectedSeats.length * trip.price : 0;

  // ✅ Handle seat selection
  const handleSeatSelect = (seat: string) => {
    if (bookedSeats.includes(seat)) return; // Prevent clicking unavailable seat
    setSelectedSeats((prev) =>
      prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
    );
  };

  // ✅ Confirm booking
  const handleConfirmBooking = async () => {
    if (!trip) return;
    if (!selectedSeats.length) {
      alert("Please select at least one seat.");
      return;
    }

    // No validation required - all fields are optional

    setLoading(true);
    try {
      const token = localStorage.getItem("bookra_token") || localStorage.getItem("token");
      const payload = {
        trip_id: tripId,
        seat_numbers: selectedSeats,
        amount: total,
        passenger_details: {
          title,
          first_name: firstName,
          middle_name: middleName,
          last_name: lastName,
          date_of_birth: dateOfBirth,
          nationality,
          document_type: documentType,
          document_number: documentNumber,
        },
        contact_email: contactEmail,
        contact_phone: contactPhone,
        contact_address: address,
        contact_city: city,
        contact_country: country,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/v1/bookings/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Booking failed");
      }

      const data = await res.json();
      // Redirect to payment page
      router.push(`/traveler/payment/${data.booking_id}`);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Booking failed.");
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Dynamic seat map generator
  function renderSeatMap() {
    if (!trip) return null;

    const totalSeats = trip.total_seats || 30;
    const mode = trip.mode?.toLowerCase();

    // Helper for seat buttons
    const makeSeatButton = (seat: string, seatIndex: number) => {
      // Don't render seats beyond totalSeats
      if (seatIndex >= totalSeats) return null;

      const isBooked = bookedSeats.includes(seat);
      const isSelected = selectedSeats.includes(seat);
      return (
        <button
          key={seat}
          onClick={() => handleSeatSelect(seat)}
          disabled={isBooked}
          className={`w-10 h-10 text-sm rounded ${
            isBooked
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : isSelected
              ? "bg-blue-600 text-white"
              : "bg-green-100 hover:bg-green-200"
          }`}
        >
          {seat}
        </button>
      );
    };

    // ✈️ Flight layout (3–aisle–3)
    if (mode === "flight") {
      const seatLetters = ["A", "B", "C", "D", "E", "F"];
      const rows = Math.ceil(totalSeats / 6);
      let seatCounter = 0;

      return (
        <div className="flex flex-col items-center gap-2 mb-6">
          {Array.from({ length: rows }).map((_, row) => {
            const rowSeats = [];

            // Left side (A, B, C)
            for (let i = 0; i < 3; i++) {
              if (seatCounter < totalSeats) {
                const seat = `${row + 1}${seatLetters[i]}`;
                rowSeats.push(makeSeatButton(seat, seatCounter));
                seatCounter++;
              }
            }

            // Aisle
            rowSeats.push(<div key={`aisle-${row}`} className="w-4" />);

            // Right side (D, E, F)
            for (let i = 3; i < 6; i++) {
              if (seatCounter < totalSeats) {
                const seat = `${row + 1}${seatLetters[i]}`;
                rowSeats.push(makeSeatButton(seat, seatCounter));
                seatCounter++;
              }
            }

            return (
              <div key={row} className="flex gap-3">
                {rowSeats}
              </div>
            );
          })}
        </div>
      );
    }

    // 🚌 Bus layouts
    if (totalSeats <= 11) {
      // 11-seater minibus (2 + aisle + 2)
      const seatLetters = ["A", "B", "C", "D"];
      const rows = Math.ceil(totalSeats / 4);
      let seatCounter = 0;

      return (
        <div className="flex flex-col items-center gap-2 mb-6">
          {Array.from({ length: rows }).map((_, row) => {
            const rowSeats = [];

            // Left side (A, B)
            for (let i = 0; i < 2; i++) {
              if (seatCounter < totalSeats) {
                const seat = `${row + 1}${seatLetters[i]}`;
                rowSeats.push(makeSeatButton(seat, seatCounter));
                seatCounter++;
              }
            }

            // Aisle
            rowSeats.push(<div key={`aisle-${row}`} className="w-4" />);

            // Right side (C, D)
            for (let i = 2; i < 4; i++) {
              if (seatCounter < totalSeats) {
                const seat = `${row + 1}${seatLetters[i]}`;
                rowSeats.push(makeSeatButton(seat, seatCounter));
                seatCounter++;
              }
            }

            return (
              <div key={row} className="flex gap-3">
                {rowSeats}
              </div>
            );
          })}
        </div>
      );
    }

    if (totalSeats <= 14) {
      // 14-seater (2 + aisle + 1)
      const seatLetters = ["A", "B", "C"];
      const rows = Math.ceil(totalSeats / 3);
      let seatCounter = 0;

      return (
        <div className="flex flex-col items-center gap-2 mb-6">
          {Array.from({ length: rows }).map((_, row) => {
            const rowSeats = [];

            // Left side (A, B)
            for (let i = 0; i < 2; i++) {
              if (seatCounter < totalSeats) {
                const seat = `${row + 1}${seatLetters[i]}`;
                rowSeats.push(makeSeatButton(seat, seatCounter));
                seatCounter++;
              }
            }

            // Aisle
            rowSeats.push(<div key={`aisle-${row}`} className="w-4" />);

            // Right side (C)
            if (seatCounter < totalSeats) {
              const seat = `${row + 1}${seatLetters[2]}`;
              rowSeats.push(makeSeatButton(seat, seatCounter));
              seatCounter++;
            }

            return (
              <div key={row} className="flex gap-3">
                {rowSeats}
              </div>
            );
          })}
        </div>
      );
    }

    // Default bus/flight layout (2 + aisle + 2)
    const seatLetters = ["A", "B", "C", "D"];
    const rows = Math.ceil(totalSeats / 4);
    let seatCounter = 0;

    return (
      <div className="flex flex-col items-center gap-2 mb-6">
        {Array.from({ length: rows }).map((_, row) => {
          const rowSeats = [];

          // Left side (A, B)
          for (let i = 0; i < 2; i++) {
            if (seatCounter < totalSeats) {
              const seat = `${row + 1}${seatLetters[i]}`;
              rowSeats.push(makeSeatButton(seat, seatCounter));
              seatCounter++;
            }
          }

          // Aisle
          rowSeats.push(<div key={`aisle-${row}`} className="w-4" />);

          // Right side (C, D)
          for (let i = 2; i < 4; i++) {
            if (seatCounter < totalSeats) {
              const seat = `${row + 1}${seatLetters[i]}`;
              rowSeats.push(makeSeatButton(seat, seatCounter));
              seatCounter++;
            }
          }

          return (
            <div key={row} className="flex gap-3">
              {rowSeats}
            </div>
          );
        })}
      </div>
    );
  }

  // 🧾 Render
  if (error)
    return <p className="text-red-600 text-center mt-8">{error}</p>;
  if (!trip)
    return <p className="text-gray-600 text-center mt-8">Loading trip...</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">
        Confirm Booking — {trip.from_city} → {trip.to_city} ({trip.mode})
      </h2>
      <p className="text-gray-600 mb-6">
        Date: {trip.date} • Time: {trip.time} • Price per seat: ${trip.price}
      </p>

      {/* Step Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setCurrentStep("seats")}
          className={`pb-3 px-6 font-semibold text-sm transition-colors ${
            currentStep === "seats"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          1. Select Seats
        </button>
        <button
          onClick={() => {
            if (selectedSeats.length === 0) {
              alert("Please select at least one seat first.");
              return;
            }
            setCurrentStep("details");
          }}
          className={`pb-3 px-6 font-semibold text-sm transition-colors ${
            currentStep === "details"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          2. Passenger Details
        </button>
      </div>

      {/* Seat Selection Step */}
      {currentStep === "seats" && (
        <div>
          <h3 className="text-xl font-bold mb-4">Select Your Seats</h3>
          {renderSeatMap()}

          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-100 border border-gray-300 rounded"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-600 rounded"></div>
                <span>Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-300 rounded"></div>
                <span>Booked</span>
              </div>
            </div>
            <p className="text-right font-semibold text-blue-700 text-xl">
              Total: ${total.toFixed(2)}
            </p>
          </div>

          <button
            onClick={() => {
              if (selectedSeats.length === 0) {
                alert("Please select at least one seat.");
                return;
              }
              setCurrentStep("details");
            }}
            className="w-full py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700 font-semibold transition"
          >
            Continue to Passenger Details ({selectedSeats.length} seat{selectedSeats.length !== 1 ? "s" : ""} selected)
          </button>
        </div>
      )}

      {/* Passenger Details Step */}
      {currentStep === "details" && (
        <div>
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Selected Seats:</strong> {selectedSeats.join(", ")} • <strong>Total:</strong> ${total.toFixed(2)}
            </p>
            <button
              onClick={() => setCurrentStep("seats")}
              className="text-sm text-blue-600 hover:underline mt-2"
            >
              ← Change Seats
            </button>
          </div>

          {/* Passenger Data Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-bold mb-4 text-gray-900">Passenger Data</h3>
        <p className="text-sm text-gray-600 mb-4">
          Please enter your passenger details and ensure that the name on your booking matches the name on your passport or ID
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <select
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Mr">Mr</option>
              <option value="Mrs">Mrs</option>
              <option value="Ms">Ms</option>
              <option value="Dr">Dr</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name (Given)
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Middle Name
            </label>
            <input
              type="text"
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
              placeholder="Optional"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name (Surname)
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth (DD/MM/YYYY)
            </label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nationality
            </label>
            <input
              type="text"
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              placeholder="e.g., Kenyan"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Type
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="passport">Passport</option>
              <option value="national_id">National ID</option>
              <option value="drivers_license">Driver's License</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Number
            </label>
            <input
              type="text"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              placeholder="A12345678"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Contact Details Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-bold mb-4 text-gray-900">Contact Details</h3>
        <p className="text-sm text-gray-600 mb-4">
          Please enter your passenger details and ensure that the name on your booking matches the name on your passport or ID
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+254 700 000000"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street Address"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Town or City
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Nairobi"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country/Region
            </label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Kenya"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

          <button
            onClick={handleConfirmBooking}
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold transition ${
              loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading
              ? "Processing..."
              : `Confirm Booking (${selectedSeats.length} seat${
                  selectedSeats.length !== 1 ? "s" : ""
                })`}
          </button>
        </div>
      )}
    </div>
  );
}

