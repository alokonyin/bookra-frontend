"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OperatorApplicationPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    company_name: "",
    contact_name: "",
    contact_phone: "",
    contact_email: "",
    business_registration_number: "",
    country: "",
    city: "",
    address: "",
    description: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!form.company_name || !form.contact_name || !form.contact_phone) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

      const res = await fetch(`${API_BASE}/auth/operator/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Application submission failed");
      }

      // Success
      alert(
        `✅ ${data.message}\n\nApplication ID: ${data.application_id}\n\nYou will receive a notification once your application has been reviewed.`
      );
      router.push("/");
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="card max-w-2xl w-full p-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">
            Apply as an Operator
          </h2>
          <p className="text-neutral-600">
            Submit your application to list trips on Bookra.com. Our team will review and approve your company within 1-2 business days.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-5">
            <p className="text-center text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Company Information */}
          <div className="border-b border-neutral-200 pb-4">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">
              Company Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Molo Line Transport"
                  value={form.company_name}
                  onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Business Registration Number
                </label>
                <input
                  type="text"
                  placeholder="BUS123456"
                  value={form.business_registration_number}
                  onChange={(e) => setForm({ ...form, business_registration_number: e.target.value })}
                  className="input"
                />
                <p className="text-xs text-neutral-500 mt-1">Optional but helps with verification</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Select Country</option>
                  <option value="Kenya">Kenya</option>
                  <option value="Uganda">Uganda</option>
                  <option value="Tanzania">Tanzania</option>
                  <option value="Rwanda">Rwanda</option>
                  <option value="South Sudan">South Sudan</option>
                  <option value="Burundi">Burundi</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nairobi"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  placeholder="123 Main Street, Nairobi"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="border-b border-neutral-200 pb-4">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">
              Contact Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Contact Person Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={form.contact_name}
                  onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="+254712345678 or 0712345678"
                  value={form.contact_phone}
                  onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                  className="input"
                  required
                />
                <p className="text-xs text-neutral-500 mt-1">
                  We'll use this for your operator account
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="contact@yourcompany.com"
                  value={form.contact_email}
                  onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                  className="input"
                />
                <p className="text-xs text-neutral-500 mt-1">Optional</p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">
              Additional Information
            </h3>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Tell us about your company
              </label>
              <textarea
                placeholder="Describe your transport services, routes, fleet size, years in operation, etc."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input min-h-[120px]"
                rows={5}
              />
              <p className="text-xs text-neutral-500 mt-1">
                This helps us understand your business better
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="btn w-full !mt-6"
            disabled={loading}
          >
            {loading ? "Submitting Application..." : "Submit Application"}
          </button>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Our team will review your application within 1-2 business days</li>
              <li>• You'll receive a notification via phone/email once approved</li>
              <li>• Upon approval, you can log in and start listing your trips</li>
              <li>• If we need more information, we'll contact you</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-neutral-200">
          <p className="text-center text-sm text-neutral-600">
            Already have an account?{" "}
            <a
              className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
              href="/signin?role=operator"
            >
              Sign In
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
