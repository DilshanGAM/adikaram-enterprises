import { UserType } from "@/types/user";
import { PrismaClient, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const search = searchParams.get("search") || "";

    try {
        // Build the where clause for search
		const whereClause = search ? {
			OR: [
				{ name: { contains: search, mode: Prisma.QueryMode.insensitive } },
				{ email: { contains: search, mode: Prisma.QueryMode.insensitive } },
				{ role: { contains: search, mode: Prisma.QueryMode.insensitive } }
			]
		} : {};

        // Get total count for pagination
        const totalItems = await prisma.user.count({
            where: whereClause
        });

        // Get paginated results
        const users = await prisma.user.findMany({
            where: whereClause,
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: {
                name: 'asc'
            }
        });

        const totalPages = Math.ceil(totalItems / pageSize);

        return NextResponse.json({
            users,
            currentPage: page,
            totalPages,
            totalItems
        });
    } catch (e: any) {
        return NextResponse.json(
            { message: "Error fetching users", error: e.message },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
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

        const { email, name, phone, whatsapp, address, title, role, status, password } = body;

        // Validation
        if (!email || !name || !role || !password) {
            return NextResponse.json(
                { message: "Missing required fields: email, name, role, or password" },
                { status: 400 }
            );
        }

        // Password validation
        if (password.length < 6) {
            return NextResponse.json(
                { message: "Password must be at least 6 characters long" },
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

        // Hash the password before storing
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user with hashed password
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
                password: hashedPassword
            },
        });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = newUser;

        prisma.$disconnect();
        return NextResponse.json(
            { message: "User created successfully", user: userWithoutPassword },
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
