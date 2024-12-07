"use client";
import React, { useEffect, useState } from "react";

import {
	FaCog,
	FaFileInvoice,
	FaHome,
	FaRoute,
	FaSignOutAlt,
} from "react-icons/fa";
import { FaShop, FaUserGroup } from "react-icons/fa6";
import { MdWarehouse } from "react-icons/md";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
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

	return (
		<div className="flex h-screen">
			{/* Sidebar */}
			<div
				className={`${
					isOpen ? "w-64" : "w-16"
				} bg-pepsiBlue text-white flex flex-col transition-all duration-300`}
			>
				{/* Sidebar Header */}
				<div className="flex items-center gap-2 p-4">
					<img
						src="/favicon.png"
						alt="Adikaram Enterprises Logo"
						className="w-8 h-8 cursor-pointer border-white rounded-full border-[2px] bg-white"
						onClick={toggleSidebar} // Logo acts as the toggle button
					/>
					{isOpen && (
						<div className="flex items-center justify-between w-full">
							<h1 className="text-lg font-bold whitespace-nowrap">
								Adikaram Enterprises
							</h1>
						</div>
					)}
				</div>

				{/* Menu Items */}
				<div className="flex-1 flex flex-col gap-4 mt-4">
					<NavItem
						link="/admin"
						icon={<FaHome />}
						label="Home"
						isOpen={isOpen}
					/>
					<NavItem
						link="/admin/users"
						icon={<FaUserGroup />}
						label="Users"
						isOpen={isOpen}
					/>
					<NavItem
						link="/admin/routes"
						icon={<FaRoute />}
						label="Routes"
						isOpen={isOpen}
					/>
					<NavItem
						link="/admin/shops"
						icon={<FaShop />}
						label="Shops"
						isOpen={isOpen}
					/>
					<NavItem
						link="/admin/stock"
						icon={<MdWarehouse />}
						label="Stock"
						isOpen={isOpen}
					/>
					<NavItem
						link="/admin/bills"
						icon={<FaFileInvoice />}
						label="Bills"
						isOpen={isOpen}
					/>
					<NavItem
						link="/admin/settings"
						icon={<FaCog />}
						label="Settings"
						isOpen={isOpen}
					/>
					<NavItem
						link="/logout"
						icon={<FaSignOutAlt />}
						label="Logout"
						isOpen={isOpen}
					/>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1 bg-gray-100">{children}</div>
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
	if(link === "/admin"){
		isActive = pathname === link;
	}else{
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
