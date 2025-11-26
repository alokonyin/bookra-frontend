"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import cities from "../data/cities.json";

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<"bus" | "flight">("bus");

  // Bus search state
  const [busFrom, setBusFrom] = useState("");
  const [busTo, setBusTo] = useState("");
  const [busDate, setBusDate] = useState("");
  const [busPassengers, setBusPassengers] = useState(1);

  // Flight search state
  const [tripType, setTripType] = useState<"oneway" | "roundtrip">("oneway");
  const [flightFrom, setFlightFrom] = useState("");
  const [flightTo, setFlightTo] = useState("");
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [flightPassengers, setFlightPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState("economy");

  // Results
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults([]);
    setSearched(true);

    const from = mode === "bus" ? busFrom : flightFrom;
    const to = mode === "bus" ? busTo : flightTo;
    const date = mode === "bus" ? busDate : departDate;
    const passengers = mode === "bus" ? busPassengers : flightPassengers;

    try {
      const url = new URL("http://127.0.0.1:8000/v1/traveler/search");
      url.search = new URLSearchParams({
        from_city: from,
        to_city: to,
        date,
        mode,
      }).toString();

      const res = await fetch(url.toString(), {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Search failed");
      }

      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Search error:", err);
      setError(err.message || "Failed to search trips");
    } finally {
      setLoading(false);
    }
  }

  function handleBookNow(tripId: number) {
    const from = mode === "bus" ? busFrom : flightFrom;
    const to = mode === "bus" ? busTo : flightTo;
    const date = mode === "bus" ? busDate : departDate;
    const passengers = mode === "bus" ? busPassengers : flightPassengers;

    // Save search parameters and trip selection
    localStorage.setItem(
      "lastSearch",
      JSON.stringify({ from, to, date, passengers, mode })
    );
    localStorage.setItem("selectedTripId", String(tripId));

    // Redirect to sign in with return URL
    router.push("/signin?redirect=/traveler");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800">
      {/* Hero Section */}
      <div className="container-max pt-12 pb-32">
        <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-3">
          Find your next adventure
        </h1>
        <p className="text-blue-100 text-center text-lg mb-8">
          Search buses and flights across East Africa
        </p>

        {/* Search Card */}
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-5xl mx-auto">
          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setMode("bus")}
              className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 transition-colors ${
                mode === "bus"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span className="text-xl">🚌</span>
              Buses
            </button>
            <button
              onClick={() => setMode("flight")}
              className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 transition-colors ${
                mode === "flight"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span className="text-xl">✈️</span>
              Flights
            </button>
          </div>

          {/* Bus Search Form */}
          {mode === "bus" && (
            <form onSubmit={handleSearch}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    list="cities"
                    placeholder="City"
                    value={busFrom}
                    onChange={(e) => setBusFrom(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    list="cities"
                    placeholder="City"
                    value={busTo}
                    onChange={(e) => setBusTo(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departure
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="date"
                    value={busDate}
                    onChange={(e) => setBusDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passengers
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="number"
                    min={1}
                    value={busPassengers}
                    onChange={(e) => setBusPassengers(Number(e.target.value))}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition"
                disabled={loading}
              >
                {loading ? "Searching..." : "Search Buses"}
              </button>
            </form>
          )}

          {/* Flight Search Form */}
          {mode === "flight" && (
            <form onSubmit={handleSearch}>
              {/* Trip Type */}
              <div className="flex gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tripType"
                    value="oneway"
                    checked={tripType === "oneway"}
                    onChange={(e) => setTripType(e.target.value as "oneway")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium">One-way</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tripType"
                    value="roundtrip"
                    checked={tripType === "roundtrip"}
                    onChange={(e) => setTripType(e.target.value as "roundtrip")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium">Round-trip</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    list="cities"
                    placeholder="City"
                    value={flightFrom}
                    onChange={(e) => setFlightFrom(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    list="cities"
                    placeholder="City"
                    value={flightTo}
                    onChange={(e) => setFlightTo(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Depart
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="date"
                    value={departDate}
                    onChange={(e) => setDepartDate(e.target.value)}
                    required
                  />
                </div>
                {tripType === "roundtrip" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Return
                    </label>
                    <input
                      className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      required={tripType === "roundtrip"}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passengers
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="number"
                    min={1}
                    value={flightPassengers}
                    onChange={(e) => setFlightPassengers(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cabin Class
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={cabinClass}
                    onChange={(e) => setCabinClass(e.target.value)}
                  >
                    <option value="economy">Economy</option>
                    <option value="business">Business</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition"
                disabled={loading}
              >
                {loading ? "Searching..." : "Search Flights"}
              </button>
            </form>
          )}

          {/* Autocomplete dropdown options */}
          <datalist id="cities">
            {cities.map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>
        </div>
      </div>

      {/* Experience Section */}
      {!searched && (
        <div className="container-max pb-16">
          {/* Hero Banner - Buses & Flights */}
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-white text-center mb-3">
              Travel Across East Africa
            </h2>
            <p className="text-blue-100 text-center text-xl mb-10">
              Your complete travel solution - Buses & Flights
            </p>

            {/* Two Column Layout - Bus & Flight Showcase */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {/* Bus Travel Card */}
              <div className="group relative overflow-hidden rounded-2xl shadow-2xl cursor-pointer transform transition-all hover:scale-[1.02]">
                <div className="aspect-[16/10] bg-gradient-to-br from-orange-400 via-red-500 to-pink-600 relative">
                  <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-opacity" />
                  {/* Decorative Elements */}
                  <div className="absolute top-6 right-6 text-white text-6xl opacity-20">🚌</div>
                  <div className="absolute inset-0 flex flex-col justify-end p-8">
                    <div className="mb-4">
                      <span className="inline-block bg-white bg-opacity-20 backdrop-blur-sm px-4 py-1 rounded-full text-white text-sm font-medium mb-3">
                        Comfortable Journeys
                      </span>
                    </div>
                    <h3 className="text-white text-4xl font-bold mb-3">Bus Travel</h3>
                    <p className="text-white text-lg opacity-90 mb-4">
                      Affordable, reliable, and comfortable bus services connecting major cities
                    </p>
                    <div className="flex gap-4 text-white text-sm">
                      <span>✓ Daily Departures</span>
                      <span>✓ Modern Coaches</span>
                      <span>✓ From $25</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Flight Travel Card */}
              <div className="group relative overflow-hidden rounded-2xl shadow-2xl cursor-pointer transform transition-all hover:scale-[1.02]">
                <div className="aspect-[16/10] bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 relative">
                  <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-opacity" />
                  {/* Decorative Elements */}
                  <div className="absolute top-6 right-6 text-white text-6xl opacity-20">✈️</div>
                  <div className="absolute inset-0 flex flex-col justify-end p-8">
                    <div className="mb-4">
                      <span className="inline-block bg-white bg-opacity-20 backdrop-blur-sm px-4 py-1 rounded-full text-white text-sm font-medium mb-3">
                        Fast & Convenient
                      </span>
                    </div>
                    <h3 className="text-white text-4xl font-bold mb-3">Flight Bookings</h3>
                    <p className="text-white text-lg opacity-90 mb-4">
                      Quick connections between major airports across East Africa
                    </p>
                    <div className="flex gap-4 text-white text-sm">
                      <span>✓ Multiple Airlines</span>
                      <span>✓ Best Prices</span>
                      <span>✓ From $120</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Attractions Grid - Safari, Beach, City */}
            <h3 className="text-3xl font-bold text-white text-center mb-3">
              Discover East Africa
            </h3>
            <p className="text-blue-100 text-center text-lg mb-8">
              From pristine beaches to thrilling bookrais and vibrant cities
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Safari Experience */}
              <div className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer transform transition-transform hover:scale-105">
                <div className="aspect-[4/3] bg-gradient-to-br from-amber-600 via-orange-600 to-yellow-700 relative">
                  <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-opacity" />
                  {/* Safari Icon */}
                  <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl opacity-40">
                    🦁
                  </div>
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <span className="inline-block bg-orange-500 bg-opacity-80 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-medium mb-2 w-fit">
                      Wildlife Adventures
                    </span>
                    <h3 className="text-white text-2xl font-bold mb-2">Safari Tours</h3>
                    <p className="text-white text-sm opacity-90 mb-2">
                      Witness the Big Five in their natural habitat
                    </p>
                    <p className="text-white text-xs opacity-80">Maasai Mara • Serengeti • Amboseli</p>
                  </div>
                </div>
              </div>

              {/* Beach Paradise */}
              <div className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer transform transition-transform hover:scale-105">
                <div className="aspect-[4/3] bg-gradient-to-br from-cyan-400 via-blue-500 to-teal-600 relative">
                  <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-opacity" />
                  {/* Beach Icon */}
                  <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl opacity-40">
                    🏖️
                  </div>
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <span className="inline-block bg-cyan-500 bg-opacity-80 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-medium mb-2 w-fit">
                      Coastal Escapes
                    </span>
                    <h3 className="text-white text-2xl font-bold mb-2">Beach Holidays</h3>
                    <p className="text-white text-sm opacity-90 mb-2">
                      Relax on pristine white sand beaches
                    </p>
                    <p className="text-white text-xs opacity-80">Zanzibar • Diani • Lamu</p>
                  </div>
                </div>
              </div>

              {/* City Experience */}
              <div className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer transform transition-transform hover:scale-105">
                <div className="aspect-[4/3] bg-gradient-to-br from-purple-500 via-pink-500 to-red-600 relative">
                  <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-opacity" />
                  {/* City Icon */}
                  <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl opacity-40">
                    🏙️
                  </div>
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <span className="inline-block bg-purple-500 bg-opacity-80 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-medium mb-2 w-fit">
                      Urban Adventures
                    </span>
                    <h3 className="text-white text-2xl font-bold mb-2">City Breaks</h3>
                    <p className="text-white text-sm opacity-90 mb-2">
                      Explore vibrant markets and modern cities
                    </p>
                    <p className="text-white text-xs opacity-80">Nairobi • Kampala • Dar es Salaam</p>
                  </div>
                </div>
              </div>

              {/* Mountain Treks */}
              <div className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer transform transition-transform hover:scale-105">
                <div className="aspect-[4/3] bg-gradient-to-br from-slate-500 via-gray-600 to-zinc-700 relative">
                  <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-opacity" />
                  <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl opacity-40">
                    🏔️
                  </div>
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <span className="inline-block bg-gray-500 bg-opacity-80 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-medium mb-2 w-fit">
                      Peak Adventures
                    </span>
                    <h3 className="text-white text-2xl font-bold mb-2">Mountain Treks</h3>
                    <p className="text-white text-sm opacity-90 mb-2">
                      Conquer Africa's highest peaks
                    </p>
                    <p className="text-white text-xs opacity-80">Mt. Kilimanjaro • Mt. Kenya</p>
                  </div>
                </div>
              </div>

              {/* Cultural Heritage */}
              <div className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer transform transition-transform hover:scale-105">
                <div className="aspect-[4/3] bg-gradient-to-br from-emerald-500 via-teal-600 to-green-700 relative">
                  <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-opacity" />
                  <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl opacity-40">
                    🎭
                  </div>
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <span className="inline-block bg-emerald-500 bg-opacity-80 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-medium mb-2 w-fit">
                      Cultural Tours
                    </span>
                    <h3 className="text-white text-2xl font-bold mb-2">Heritage Sites</h3>
                    <p className="text-white text-sm opacity-90 mb-2">
                      Discover rich history and traditions
                    </p>
                    <p className="text-white text-xs opacity-80">Stone Town • Gorée Island</p>
                  </div>
                </div>
              </div>

              {/* Adventure Sports */}
              <div className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer transform transition-transform hover:scale-105">
                <div className="aspect-[4/3] bg-gradient-to-br from-rose-500 via-red-600 to-orange-700 relative">
                  <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-opacity" />
                  <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl opacity-40">
                    🪂
                  </div>
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <span className="inline-block bg-rose-500 bg-opacity-80 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-medium mb-2 w-fit">
                      Thrill Seekers
                    </span>
                    <h3 className="text-white text-2xl font-bold mb-2">Adventure Sports</h3>
                    <p className="text-white text-sm opacity-90 mb-2">
                      Rafting, diving, and skydiving
                    </p>
                    <p className="text-white text-xs opacity-80">Nile River • Malindi • Nakuru</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Why Choose Us Section */}
          <div className="bg-white rounded-xl shadow-lg p-8 mt-12">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Why Travel with Bookra.com?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎫</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Easy Booking
                </h3>
                <p className="text-gray-600">
                  Book your bus or flight tickets in just a few clicks. Simple, fast, and secure.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">💰</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Best Prices
                </h3>
                <p className="text-gray-600">
                  Compare prices from multiple operators and find the best deals for your journey.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🛡️</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Safe & Secure
                </h3>
                <p className="text-gray-600">
                  Your data is protected with industry-standard security measures.
                </p>
              </div>
            </div>
          </div>

          {/* Popular Routes Section */}
          <div className="bg-white rounded-xl shadow-lg p-8 mt-12">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Popular Routes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Route 1 */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="text-2xl">🚌</div>
                  <div>
                    <p className="font-semibold text-gray-900">Juba → Kampala</p>
                    <p className="text-sm text-gray-500">Daily departures</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">From $30</p>
                  <p className="text-xs text-gray-500">~10 hours</p>
                </div>
              </div>

              {/* Route 2 */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="text-2xl">✈️</div>
                  <div>
                    <p className="font-semibold text-gray-900">Nairobi → Kigali</p>
                    <p className="text-sm text-gray-500">Multiple daily flights</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">From $120</p>
                  <p className="text-xs text-gray-500">~2 hours</p>
                </div>
              </div>

              {/* Route 3 */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="text-2xl">🚌</div>
                  <div>
                    <p className="font-semibold text-gray-900">Nairobi → Mombasa</p>
                    <p className="text-sm text-gray-500">Express & luxury buses</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">From $25</p>
                  <p className="text-xs text-gray-500">~8 hours</p>
                </div>
              </div>

              {/* Route 4 */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="text-2xl">✈️</div>
                  <div>
                    <p className="font-semibold text-gray-900">Kampala → Dar es Salaam</p>
                    <p className="text-sm text-gray-500">Daily flights available</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">From $150</p>
                  <p className="text-xs text-gray-500">~2.5 hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {searched && !loading && (
        <div className="container-max pb-16">
          <div className="bg-white rounded-lg shadow-lg p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            )}

            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {results.length > 0
                ? `${results.length} ${mode === "bus" ? "bus" : "flight"}${
                    results.length !== 1 ? "es" : ""
                  } found`
                : `No ${mode === "bus" ? "buses" : "flights"} found`}
            </h2>

            {results.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-600 text-lg">
                  No trips found for your search criteria.
                </p>
                <p className="text-gray-500 mt-2">
                  Try different cities or dates.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((trip: any) => (
                  <div
                    key={trip.id}
                    className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4 flex-1">
                        {trip.operator?.logo_url && (
                          <img
                            src={trip.operator.logo_url}
                            alt={trip.operator.name || "Logo"}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-bold text-lg text-gray-900">
                            {trip.operator?.name || "Operator"}
                          </p>
                          {trip.operator?.company_name && (
                            <p className="text-sm text-gray-500">
                              {trip.operator.company_name}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-8">
                        <div className="text-center">
                          <p className="text-xl font-bold text-gray-900">
                            {trip.from_city}
                          </p>
                          <p className="text-sm text-gray-500">{trip.time}</p>
                        </div>

                        <div className="text-center">
                          <p className="text-2xl">→</p>
                          <p className="text-xs text-gray-500">
                            {mode === "bus" ? "Bus" : "Flight"}
                          </p>
                        </div>

                        <div className="text-center">
                          <p className="text-xl font-bold text-gray-900">
                            {trip.to_city}
                          </p>
                          <p className="text-sm text-gray-500">{trip.date}</p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-gray-500 mb-1">
                            {trip.seats_available} seats
                          </p>
                          <p className="text-2xl font-bold text-blue-600 mb-2">
                            ${trip.price}
                          </p>
                          <button
                            onClick={() => handleBookNow(trip.id)}
                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition font-medium text-sm"
                          >
                            Select
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
