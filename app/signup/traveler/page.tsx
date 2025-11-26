"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type SignupStep = "phone" | "otp" | "details";

export default function TravelerSignupPage() {
  const router = useRouter();

  // Multi-step form state
  const [step, setStep] = useState<SignupStep>("phone");
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);

  // Step 1: Send OTP to phone
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!phone) {
      setError("Please enter your phone number");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://127.0.0.1:8000/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone,
          purpose: "signup",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to send OTP");
      }

      setSuccess("OTP sent! Check your phone for the verification code.");
      setStep("otp");
      startCountdown();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!otpCode || otpCode.length !== 6) {
      setError("Please enter the 6-digit OTP code");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://127.0.0.1:8000/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone,
          otp_code: otpCode,
          purpose: "signup",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Invalid OTP code");
      }

      setSuccess("Phone verified! Please complete your profile.");
      setStep("details");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Complete signup
  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name || !password) {
      setError("Name and password are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://127.0.0.1:8000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "traveler",
          phone: phone,
          name: name,
          email: email || null,
          password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Signup failed");
      }

      // Success - redirect to login
      alert("✅ Account created successfully! Please sign in to continue.");
      router.push("/signin?role=traveler");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (!canResend) return;

    setError(null);
    setSuccess(null);

    try {
      setLoading(true);

      const res = await fetch("http://127.0.0.1:8000/auth/otp/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone,
          purpose: "signup",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to resend OTP");
      }

      setSuccess("OTP resent successfully!");
      startCountdown();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Countdown timer for resend
  const startCountdown = () => {
    setCanResend(false);
    setCountdown(60);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-50">
      <div className="card max-w-md w-full p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">
            Create Your Account
          </h2>
          <p className="text-neutral-600">
            Join Bookra.com to search and book trips across East Africa
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-between mb-8">
          <div className={`flex items-center ${step === "phone" ? "text-primary-600" : step === "otp" || step === "details" ? "text-green-600" : "text-gray-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === "phone" ? "border-primary-600 bg-primary-50" : step === "otp" || step === "details" ? "border-green-600 bg-green-50" : "border-gray-300"}`}>
              {step === "otp" || step === "details" ? "✓" : "1"}
            </div>
            <span className="ml-2 text-sm font-medium">Phone</span>
          </div>

          <div className="flex-1 h-0.5 bg-gray-300 self-center mx-2"></div>

          <div className={`flex items-center ${step === "otp" ? "text-primary-600" : step === "details" ? "text-green-600" : "text-gray-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === "otp" ? "border-primary-600 bg-primary-50" : step === "details" ? "border-green-600 bg-green-50" : "border-gray-300"}`}>
              {step === "details" ? "✓" : "2"}
            </div>
            <span className="ml-2 text-sm font-medium">Verify</span>
          </div>

          <div className="flex-1 h-0.5 bg-gray-300 self-center mx-2"></div>

          <div className={`flex items-center ${step === "details" ? "text-primary-600" : "text-gray-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === "details" ? "border-primary-600 bg-primary-50" : "border-gray-300"}`}>
              3
            </div>
            <span className="ml-2 text-sm font-medium">Details</span>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-5">
            <p className="text-center text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-5">
            <p className="text-center text-sm text-green-600">{success}</p>
          </div>
        )}

        {/* Step 1: Phone Number */}
        {step === "phone" && (
          <form onSubmit={handleSendOTP} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+254712345678 or 0712345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input"
                required
              />
              <p className="text-xs text-neutral-500 mt-1.5">
                Enter your phone number. We'll send you a verification code.
              </p>
            </div>

            <button type="submit" className="btn w-full !mt-6" disabled={loading}>
              {loading ? "Sending..." : "Send Verification Code"}
            </button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOTP} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="input text-center text-2xl tracking-widest"
                maxLength={6}
                required
              />
              <p className="text-xs text-neutral-500 mt-1.5">
                Enter the code sent to {phone}
              </p>
            </div>

            <button type="submit" className="btn w-full !mt-6" disabled={loading}>
              {loading ? "Verifying..." : "Verify Code"}
            </button>

            <div className="text-center mt-4">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  disabled={loading}
                >
                  Resend Code
                </button>
              ) : (
                <p className="text-sm text-neutral-500">
                  Resend code in {countdown}s
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setStep("phone")}
              className="text-sm text-neutral-600 hover:text-neutral-800 mt-2 block mx-auto"
            >
              ← Change phone number
            </button>
          </form>
        )}

        {/* Step 3: Complete Details */}
        {step === "details" && (
          <form onSubmit={handleCompleteSignup} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Email Address <span className="text-neutral-400 font-normal">(optional)</span>
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                required
              />
              <p className="text-xs text-neutral-500 mt-1.5">
                At least 6 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input"
                required
              />
            </div>

            <button type="submit" className="btn w-full !mt-6" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-neutral-200">
          <p className="text-center text-sm text-neutral-600">
            Already have an account?{" "}
            <a
              className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
              href="/signin?role=traveler"
            >
              Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
