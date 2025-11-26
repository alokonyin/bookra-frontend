"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { clearAuth } from "@/lib/auth";

export default function OperatorHeader() {
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    router.replace("/signin");
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between bg-white border-b shadow-sm px-6 py-3">
      {/* Left: Logo + Title */}
      <div
        className="flex items-center gap-2 cursor-pointer select-none"
        onClick={() => router.push("/operator")}
      >
        <Image
          src="/logo.svg"
          alt="Bookra Logo"
          width={36}
          height={36}
          className="rounded"
        />
        <span className="text-lg font-semibold text-gray-800">
          Bookra Operator
        </span>
      </div>

      {/* Right: Logout */}
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
      >
        Logout
      </button>
    </header>
  );
}
