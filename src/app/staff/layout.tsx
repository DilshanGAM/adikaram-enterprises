"use client";
import React, { useEffect, useState } from "react";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

export default function StaffLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  interface User {
    name: string;
  }

  const [greeting, setGreeting] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Check for token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
  }, []);

  useEffect(() => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }, []);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good Morning");
    } else if (hour < 17) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  return (
    <div className="flex h-screen">
      {/* Main Content */}
      <div className="flex-1 bg-gray-100">
        <div className="flex items-center justify-between  bg-pepsiBlue text-white p-4 sticky top-0 z-10">
          <img
            src="/favicon.png"
            alt="Adikaram Enterprises Logo"
            className="w-6 h-6 md:h-8 md:w-8 cursor-pointer border-white rounded-full border-[2px] bg-white"
            onClick={toggleSidebar} // Logo acts as the toggle button
          />

       <div className="flex items-center gap-4">
           <div className="text-xl ml-3">
             Hi, <span className="font-semibold">{user?.name ?? "Guest"}</span> -{" "}
             {greeting}!
           </div>
        
           <button
             onClick={handleLogout}
             className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 text-sm"
           >
             Logout
           </button>
       </div>
        </div>
        {children}
      </div>
    </div>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isOpen: boolean;
  link: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isOpen, link }) => {
  const pathname = usePathname();
  let isActive = false;
  if (link === "/staff") {
    isActive = pathname === link;
  } else {
    isActive = pathname.includes(link);
  }

  return (
    <Link
      href={link}
      className={`flex items-center gap-4 px-4 py-2 cursor-pointer ${
        isActive ? "bg-gray-700 text-white" : "hover:bg-gray-600 text-gray-300"
      }`}
    >
      <div className="text-xl">{icon}</div>
      {isOpen && <span className="text-sm">{label}</span>}
    </Link>
  );
};
