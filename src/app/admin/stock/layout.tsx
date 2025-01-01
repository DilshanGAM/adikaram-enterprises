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
    <div className="w-full pt-[75px] relative ">
      {/* Navigation Buttons */}
      <div className="flex bg-[#f3f4f6]  pt-4  w-full absolute top-0 left-0  items-center border-b-gray-200 border-solid border-b-2">
        <Link href="/admin/stock">
          <button
            className={`px-4 py-2  mx-2 ${
              isActive("/admin/stock")
                ? "border-b-pepsiBlue border-solid border-b-2"
                : " hover:bg-gray-300"
            }`}
          >
            Products
          </button>
        </Link>
        <Link href="/admin/stock/batches">
          <button
            className={`px-4 py-2  mx-2 ${
              isActive("/admin/stock/batches")
                ? "border-b-pepsiBlue border-solid border-b-2"
                : " hover:bg-gray-300"
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
