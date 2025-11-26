"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import OperatorHeader from "@/components/OperatorHeader";

export default function OperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  // ✅ Redirect if not logged in
  useEffect(() => {
    const token = localStorage.getItem("bookra_token") || localStorage.getItem("token");
    if (!token) router.replace("/signin");
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <OperatorHeader />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
