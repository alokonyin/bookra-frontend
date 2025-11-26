import { useState } from "react";
import { createTrip } from "../../api/operator";
import OperatorNav from "../../components/OperatorNav";

export default function AddBus() {
  const [form, setForm] = useState({
    from_city: "",
    to_city: "",
    date: "",
    time: "",
    price: "",
    total_seats: "",
  });
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await createTrip(form);
    if (res.id) setMessage("Bus added successfully!");
    else setMessage("Error creating bus trip.");
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="p-6">
      <OperatorNav />
      <h1 className="text-xl font-semibold mb-4">Add New Bus</h1>

      <form onSubmit={handleSubmit} className="grid gap-3 max-w-md">
        {["from_city", "to_city", "date", "time", "price", "total_seats"].map(
          (f) => (
            <input
              key={f}
              name={f}
              type={f === "date" || f === "time" ? f : "text"}
              placeholder={f.replace("_", " ")}
              onChange={handleChange}
              className="p-2 border rounded"
            />
          )
        )}
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Save Trip
        </button>
      </form>

      {message && <p className="mt-4 text-green-600">{message}</p>}
    </div>
  );
}
