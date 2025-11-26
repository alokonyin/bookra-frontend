import { useEffect, useState } from "react";
import { getPaymentMethod, savePaymentMethod } from "../../api/operator";
import OperatorNav from "../../components/OperatorNav";

export default function PaymentMethod() {
  const [form, setForm] = useState({
    account_name: "",
    account_number: "",
    bank_name: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    getPaymentMethod().then((res) => {
      if (res?.account_name) setForm(res);
    });
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await savePaymentMethod(form);
    if (res.id) setMessage("Payment method saved successfully!");
    else setMessage("Error saving payment method.");
  };

  return (
    <div className="p-6">
      <OperatorNav />
      <h1 className="text-xl font-semibold mb-4">Payment Method</h1>

      <form onSubmit={handleSubmit} className="grid gap-3 max-w-md">
        {["account_name", "account_number", "bank_name"].map((f) => (
          <input
            key={f}
            name={f}
            placeholder={f.replace("_", " ")}
            value={form[f]}
            onChange={handleChange}
            className="p-2 border rounded"
          />
        ))}
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Save
        </button>
      </form>

      {message && <p className="mt-4 text-green-600">{message}</p>}
    </div>
  );
}
