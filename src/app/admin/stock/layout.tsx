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
    <div className="w-full pt-[75px] relative">
      {/* Navigation Buttons */}
      <div className="flex bg-[#f3f4f6]  py-4 h-[75px]  w-full absolute top-0 left-0 justify-center items-center">
        <Link href="/admin/stock">
          <button
            className={`px-4 py-2 rounded mx-2 ${
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
            className={`px-4 py-2 rounded mx-2 ${
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
