"use client";
import { useState } from "react";

export default function AdminPayment() {
  const [form, setForm] = useState({
    account_name: "",
    account_number: "",
    bank_name: "",
  });
  const [msg, setMsg] = useState("");



//   useEffect(() => {
//   const fetchPayment = async () => {
//     const token = localStorage.getItem("bookra_token");
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/v1/admin/payment-method`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     if (res.ok) {
//       const data = await res.json();
//       setForm(data);
//     }
//   };
//   fetchPayment();
// }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem("bookra_token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/v1/admin/payment-method`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    if (res.ok) setMsg("Payment method saved!");
    else setMsg("Error saving payment method");
  }

  

  return (
    <div className="p-8 max-w-md">
      <h1 className="text-xl font-bold mb-4">Admin Payment Method</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className="border w-full p-2 rounded"
          placeholder="Account Name"
          value={form.account_name}
          onChange={(e) => setForm({ ...form, account_name: e.target.value })}
        />
        <input
          className="border w-full p-2 rounded"
          placeholder="Account Number"
          value={form.account_number}
          onChange={(e) => setForm({ ...form, account_number: e.target.value })}
        />
        <input
          className="border w-full p-2 rounded"
          placeholder="Bank Name"
          value={form.bank_name}
          onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded w-full">
          Save
        </button>
      </form>
      {msg && <p className="mt-3 text-green-600">{msg}</p>}
    </div>
  );
}
