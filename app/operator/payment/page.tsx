"use client";

import React, { useEffect, useState } from "react";
import { getPaymentMethod, savePaymentMethod } from "@/api/operator";


export default function PaymentMethod() {
  const [form, setForm] = useState({
    bank_name: "",
    account_name: "",
    account_number: "",
  });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    getPaymentMethod()
      .then(setForm)
      .catch(() => console.log("No payment method found"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    try {
      await savePaymentMethod(form);
      setMsg("Payment method saved successfully!");
    } catch (err: any) {
      setMsg(err.message || "Failed to save payment method");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Payment Method</h2>
      <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
        <input
          className="input"
          placeholder="Bank name"
          value={form.bank_name}
          onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
        />
        <input
          className="input"
          placeholder="Account name"
          value={form.account_name}
          onChange={(e) => setForm({ ...form, account_name: e.target.value })}
        />
        <input
          className="input"
          placeholder="Account number"
          value={form.account_number}
          onChange={(e) => setForm({ ...form, account_number: e.target.value })}
        />
        <button className="btn">Save Payment Method</button>
      </form>
      {msg && <p className="text-green-600 mt-3">{msg}</p>}
    </div>
  );
}
