"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function PaymentPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = Number(params.bookingId);

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "mpesa" | null>(null);

  // Card payment fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // M-Pesa fields
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [mpesaCountryCode, setMpesaCountryCode] = useState("+254");

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const token = localStorage.getItem("bookra_token");
      const res = await fetch(`http://127.0.0.1:8000/v1/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBooking(data);
    } catch (err) {
      console.error("Error fetching booking:", err);
    }
  };

  const handlePayment = async () => {
    if (!paymentMethod) {
      alert("Please select a payment method");
      return;
    }

    if (paymentMethod === "card" && (!cardNumber || !cardHolder || !expiryDate || !cvv || !termsAccepted)) {
      alert("Please fill in all card details and accept terms");
      return;
    }

    if (paymentMethod === "mpesa" && !mpesaPhone) {
      alert("Please enter your M-Pesa phone number");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("bookra_token");
      const res = await fetch("http://127.0.0.1:8000/v1/payments/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          booking_id: bookingId,
          method: paymentMethod === "mpesa" ? "mpesa" : "card",
          ...(paymentMethod === "mpesa" && {
            mpesa_phone: `${mpesaCountryCode}${mpesaPhone}`,
          }),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Payment successful! Redirecting to your trips...");
        router.push("/traveler/trips");
      } else {
        alert(data.detail || "Payment failed. Please try again.");
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!booking) {
    return <p className="text-center mt-8">Loading booking details...</p>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Payment</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Methods */}
        <div className="lg:col-span-2 space-y-6">
          {/* Credit Card */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <button
              onClick={() => setPaymentMethod(paymentMethod === "card" ? null : "card")}
              className="w-full p-4 flex items-center justify-between text-left font-semibold hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === "card" ? "border-blue-600" : "border-gray-300"
                }`}>
                  {paymentMethod === "card" && (
                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  )}
                </div>
                <span>Credit Card</span>
              </div>
              <div className="flex gap-2">
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="h-6" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
              </div>
            </button>

            {paymentMethod === "card" && (
              <div className="p-6 border-t border-gray-200">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Credit / Debit card
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim())}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={expiryDate}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, "");
                          if (value.length >= 2) {
                            value = value.slice(0, 2) + "/" + value.slice(2, 4);
                          }
                          setExpiryDate(value);
                        }}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV2/CVV2 Numbers
                      </label>
                      <input
                        type="text"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                        placeholder="123"
                        maxLength={4}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Holder Name
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="JOHN DOE"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-1"
                    />
                    <label className="text-sm text-gray-600">
                      Please confirm that you understand and accept our{" "}
                      <a href="#" className="text-blue-600 hover:underline">
                        Terms and Conditions
                      </a>{" "}
                      to continue
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* M-Pesa */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <button
              onClick={() => setPaymentMethod(paymentMethod === "mpesa" ? null : "mpesa")}
              className="w-full p-4 flex items-center justify-between text-left font-semibold hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === "mpesa" ? "border-blue-600" : "border-gray-300"
                }`}>
                  {paymentMethod === "mpesa" && (
                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  )}
                </div>
                <span>Mobile : Pay Now with MPESA</span>
              </div>
            </button>

            {paymentMethod === "mpesa" && (
              <div className="p-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-4">
                  (Expect an MPESA PIN prompt on your device)
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kindly enter your mobile number
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={mpesaCountryCode}
                      onChange={(e) => setMpesaCountryCode(e.target.value)}
                      className="w-24 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="+254">+254</option>
                      <option value="+255">+255</option>
                      <option value="+256">+256</option>
                      <option value="+250">+250</option>
                    </select>
                    <input
                      type="tel"
                      value={mpesaPhone}
                      onChange={(e) => setMpesaPhone(e.target.value.replace(/\D/g, ""))}
                      placeholder="712345678"
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handlePayment}
            disabled={loading || !paymentMethod}
            className={`w-full py-3 rounded-lg text-white font-semibold transition ${
              loading || !paymentMethod
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Processing..." : "Complete Payment"}
          </button>
        </div>

        {/* Booking Summary */}
        <div className="lg:col-span-1">
          <div className="bg-pink-600 text-white rounded-lg p-6 sticky top-6">
            <h3 className="text-lg font-bold mb-4">Summary</h3>

            <div className="space-y-3 text-sm">
              <div>
                <p className="font-semibold">
                  {booking.trip?.from_city} to {booking.trip?.to_city}
                </p>
                <p className="text-pink-100">{booking.trip?.date}</p>
              </div>

              <div className="flex justify-between items-center py-2">
                <span>{booking.trip?.time}</span>
                <span className="text-xs">Non-stop</span>
              </div>

              <div className="border-t border-pink-400 pt-3">
                <p className="text-pink-100 mb-1">
                  {booking.trip?.mode === "flight" ? "Flight" : "Bus"}
                </p>
                <p className="text-xs text-pink-200">
                  {booking.passengers} Adult{booking.passengers !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="border-t border-pink-400 pt-3">
                <div className="flex justify-between">
                  <span>Outbound: {booking.trip?.from_city} - {booking.trip?.to_city}</span>
                  <span>${booking.total_amount.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-pink-400 pt-3">
                <div className="flex justify-between text-base font-bold">
                  <span>Total price</span>
                  <span>${booking.total_amount.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-pink-700 rounded-lg p-3 mt-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Total Amount Due</span>
                  <span className="text-xl font-bold">${booking.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
