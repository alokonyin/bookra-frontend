"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // ✅ Auth guard: only admins can access /admin/*
  useEffect(() => {
    const token = localStorage.getItem("bookra_token") || localStorage.getItem("token");
    const userData = localStorage.getItem("bookra_user");
    if (!token || !userData) {
      router.push("/signin");
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== "admin") {
      router.push("/");
    }
  }, [router]);

  async function handleLogout() {
    localStorage.removeItem("bookra_token");
    localStorage.removeItem("bookra_user");
    router.push("/signin");
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 🌐 Navbar */}
      <nav className="bg-blue-700 text-white px-6 py-3 flex justify-between items-center shadow">
        <div className="flex items-center gap-6 font-medium">
          <Link href="/admin" className="hover:underline">
            Dashboard
          </Link>
          <Link href="/admin/applications" className="hover:underline">
            Operator Applications
          </Link>
          <Link href="/admin/operators" className="hover:underline">
            Manage Operators
          </Link>
          <Link href="/admin/payment-method" className="hover:underline">
            Payment Method
          </Link>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded text-sm font-semibold"
        >
          Logout
        </button>
      </nav>

      {/* Page Content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

