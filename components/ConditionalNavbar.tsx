"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";

export default function ConditionalNavbar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hide navbar on traveler, operator, office, and admin pages
  const shouldHideNavbar =
    pathname.startsWith("/traveler") ||
    pathname.startsWith("/operator") ||
    pathname.startsWith("/office") ||
    pathname.startsWith("/admin");

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  if (shouldHideNavbar) {
    return null;
  }

  return <Navbar />;
}
