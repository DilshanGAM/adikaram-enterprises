"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // Helper to check if a route is active
  const isActive = (route: string) => pathname === route;

  return (
    <div className="w-full pt-[75px]">
      {/* Navigation Buttons */}
      <div className="flex  p-4 h-[75px]  w-full fixed top-0 justify-center">
        <Link href="/admin/stock">
          <button
            className={`px-4 py-2 rounded mx-4 ${
              isActive("/admin/stock")
                ? "bg-pepsiBlue text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Products
          </button>
        </Link>
        <Link href="/admin/stock/batches">
          <button
            className={`px-4 py-2 rounded mx-4 ${
              isActive("/admin/stock/batches")
                ? "bg-pepsiBlue text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Batches
          </button>
        </Link>
      </div>
      {/* Children */}
      <div>{children}</div>
    </div>
  );
}
