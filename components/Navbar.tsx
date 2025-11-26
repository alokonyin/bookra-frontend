"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const r = useRouter();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }

    if (openDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  const tab = (label: string, href: string) => {
    const active = pathname === href;
    return (
      <button
        onClick={() => r.push(href)}
        className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
          active
            ? "bg-primary-600 text-white shadow-md"
            : "bg-transparent text-neutral-700 hover:bg-neutral-100"
        }`}
      >
        {label}
      </button>
    );
  };

  const dropdownTab = (label: string, signInHref: string, signUpHref: string) => {
    const isOpen = openDropdown === label;
    const active = pathname === signInHref || pathname === signUpHref;

    return (
      <div className="relative" ref={isOpen ? dropdownRef : null}>
        <button
          onClick={() => setOpenDropdown(isOpen ? null : label)}
          className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
            active
              ? "bg-primary-600 text-white shadow-md"
              : "bg-transparent text-neutral-700 hover:bg-neutral-100"
          }`}
        >
          {label}
        </button>

        {isOpen && (
          <div className="absolute top-full mt-2 bg-white border border-neutral-200 rounded-xl shadow-xl min-w-[160px] z-50 overflow-hidden">
            <button
              onClick={() => {
                r.push(signInHref);
                setOpenDropdown(null);
              }}
              className="w-full text-left px-4 py-3 hover:bg-primary-50 hover:text-primary-700 font-medium text-sm transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                r.push(signUpHref);
                setOpenDropdown(null);
              }}
              className="w-full text-left px-4 py-3 hover:bg-primary-50 hover:text-primary-700 font-medium text-sm transition-colors border-t border-neutral-100"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white border-b border-neutral-200 shadow-sm">
      <div className="container-max py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="badge group-hover:scale-105 transition-transform">BK</div>
          <div className="font-bold text-xl text-neutral-900">Bookra.com</div>
        </Link>
        <div className="flex gap-3">
          {tab("Book", "/")}
          {dropdownTab("Traveler", "/signin?role=traveler", "/signup/traveler")}
          {dropdownTab("Operator", "/signin?role=operator", "/signup/operator")}
          <button
            onClick={() => r.push("/signin")}
            className="px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 bg-primary-600 text-white shadow-md hover:bg-primary-700"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

