"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function RoleTabs() {
  const r = useRouter();
  const sp = useSearchParams();
  const role = sp.get("role") ?? "traveler";

  const Tab = (label: string, value: string) => {
    const active = role === value;
    return (
      <button
        onClick={() => r.push(`/signup?role=${value}`)}
        className={`px-3 py-2 rounded-full border text-sm font-semibold ${
          active ? "bg-black text-white border-black" : "border-gray-200"
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="flex gap-2">
      {Tab("Traveler", "traveler")}
      {Tab("Operator", "operator")}
      {Tab("Admin", "admin")}
    </div>
  );
}
