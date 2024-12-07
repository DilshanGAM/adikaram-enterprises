import { UserType } from "@/types/user";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
	let userHeader = req.headers.get("user");
	let user: UserType | null = userHeader ? JSON.parse(userHeader) : null;
	if (user) {
		if (user?.role === "admin" || user?.role === "manager") {
			//find all users using prisma
			try {
				const users = await prisma.user.findMany({
					where: user.role === "manager" ? { role: { not: "admin" } } : {},
				});
				prisma.$disconnect();
				return NextResponse.json({ message: "Users found", users: users });
			} catch (e) {
				return NextResponse.json(
					{ message: "Error fetching users", error: e },
					{ status: 500 }
				);
			}
		} else {
			return NextResponse.json(
				{ message: "Unauthorized", user: user },
				{ status: 401 }
			);
		}
	} else {
		return NextResponse.json({ message: "User not found" }, { status: 404 });
	}
}

export async function POST(req: NextRequest) {
	const userHeader = req.headers.get("user");
	const user: UserType | null = userHeader ? JSON.parse(userHeader) : null;

	if (!user) {
		return NextResponse.json({ message: "User not found" }, { status: 404 });
	}

	if (user.role !== "admin" && user.role !== "manager") {
		return NextResponse.json(
			{ message: "Unauthorized: Only admin and manager can create accounts" },
			{ status: 401 }
		);
	}

	try {
		const body = await req.json();

		const { email, name, phone, whatsapp, address, title, role, status } = body;

		// Validation
		if (!email || !name || !role) {
			return NextResponse.json(
				{ message: "Missing required fields: email, name, or role" },
				{ status: 400 }
			);
		}

		// Restrict roles based on the requesting user's role
		const allowedRoles =
			user.role === "admin"
				? ["admin", "manager", "staff"]
				: ["manager", "staff"];

		if (!allowedRoles.includes(role)) {
			return NextResponse.json(
				{
					message: `Unauthorized: ${
						user.role
					}s can only create the following roles: ${allowedRoles.join(", ")}`,
				},
				{ status: 403 }
			);
		}

		// Create user
		const newUser = await prisma.user.create({
			data: {
				email,
				name,
				phone,
				whatsapp,
				address,
				title,
				role,
				status: status || "active",
			},
		});

		prisma.$disconnect();
		return NextResponse.json(
			{ message: "User created successfully", user: newUser },
			{ status: 201 }
		);
	} catch (e: any) {
		prisma.$disconnect();
		return NextResponse.json(
			{ message: "Error creating user", error: e.message },
			{ status: 500 }
		);
	}
}

export async function PUT(req: NextRequest) {
	const userHeader = req.headers.get("user");
	const user: UserType | null = userHeader ? JSON.parse(userHeader) : null;

	if (!user) {
		return NextResponse.json({ message: "User not found" }, { status: 404 });
	}

	if (user.role !== "admin" && user.role !== "manager") {
		return NextResponse.json(
			{ message: "Unauthorized: Only admin and manager can update accounts" },
			{ status: 401 }
		);
	}

	try {
		const body = await req.json();

		const { name, phone, whatsapp, address, title, role, status } = body;
		const email = req.nextUrl.searchParams.get("email");

		//load the current data

		const currentUser = await prisma.user.findFirst({
			where: {
				email: email || "",
			},
		});

		if (!currentUser) {
			return NextResponse.json(
				{ message: "User with the given email not found" },
				{ status: 404 }
			);
		}

		// Validation
		if (!email || !name || !role) {
			return NextResponse.json(
				{ message: "Missing required fields: email, name, or role" },
				{ status: 400 }
			);
		}

		// Restrict roles based on the requesting user's role
		const allowedRoles =
			user.role === "admin"
				? ["admin", "manager", "staff"]
				: ["manager", "staff"];

		if (
			!allowedRoles.includes(role) ||
			!allowedRoles.includes(currentUser.role)
		) {
			return NextResponse.json(
				{
					message: `Unauthorized: ${
						user.role
					}s can only update the following roles: ${allowedRoles.join(", ")}`,
				},
				{ status: 403 }
			);
		}

		// Update user
		const updatedUser = await prisma.user.update({
			where: {
				email: req.nextUrl.searchParams.get("email") || "",
			},
			data: {
				email,
				name,
				phone,
				whatsapp,
				address,
				title,
				role,
				status: status || "active",
			},
		});

		prisma.$disconnect();
		return NextResponse.json(
			{ message: "User updated successfully", user: updatedUser },
			{ status: 200 }
		);
	} catch (e: any) {
		prisma.$disconnect();
		return NextResponse.json(
			{ message: "Error updating user", error: e.message },
			{ status: 500 }
		);
	}
}

export async function DELETE(req: NextRequest) {
	const userHeader = req.headers.get("user");
	const user: UserType | null = userHeader ? JSON.parse(userHeader) : null;

	if (!user) {
		return NextResponse.json({ message: "User not found" }, { status: 404 });
	}

	if (user.role !== "admin") {
		return NextResponse.json(
			{ message: "Unauthorized: Only admin can delete accounts" },
			{ status: 401 }
		);
	}

	try {
		const email = req.nextUrl.searchParams.get("email");

		//load the current data

		const currentUser = await prisma.user.findFirst({
			where: {
				email: email || "",
			},
		});

		if (!currentUser) {
			return NextResponse.json(
				{ message: "User with the given email not found" },
				{ status: 404 }
			);
		}

		//Check if it is the last admin
		const adminCount = await prisma.user.count({
			where: {
				role: "admin",
			},
		});
		if (currentUser.role === "admin" && adminCount < 2) {
			return NextResponse.json(
				{ message: "Cannot delete the last admin" },
				{ status: 403 }
			);
		}

		// Delete user
		await prisma.user.delete({
			where: {
				email: email || "",
			},
		});

		const logoutNeeded = user.email === email;

		prisma.$disconnect();
		return NextResponse.json(
			{ message: "User deleted successfully", logoutNeeded },
			{ status: 200 }
		);
	} catch (e: any) {
		prisma.$disconnect();
		return NextResponse.json(
			{ message: "Error deleting user", error: e.message },
			{ status: 500 }
		);
	}
}
