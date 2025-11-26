"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X, User } from "lucide-react";

export default function TravelerLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div>
      <div className="flex h-screen bg-gray-50 text-gray-800">
        {/* Sidebar */}
        <aside
          className={`fixed md:static z-20 bg-gray-100 border-r border-gray-200 w-64 p-6 transition-transform transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-blue-600">Bookra.com</h1>
            <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-3">
            <Link href="/traveler" className="block hover:text-blue-500">
              🏠 Dashboard
            </Link>
            <Link href="/traveler/trips" className="block hover:text-blue-500">
              ✈️ My Trips
            </Link>
          </nav>

          <div className="mt-10 border-t border-gray-300 pt-4">
            <Link href="/signin" className="block text-sm text-red-600 hover:underline">
              Log Out
            </Link>
          </div>
        </aside>

        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          {/* Top Navbar */}
          <header className="flex justify-between items-center bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-1 rounded hover:bg-gray-100"
              >
                <Menu size={20} />
              </button>
              <h2 className="text-lg font-semibold">Traveler Dashboard</h2>
            </div>

            <div className="flex items-center space-x-3">
              <span className="hidden sm:block">Traveler Name</span>
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                <User size={18} />
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
