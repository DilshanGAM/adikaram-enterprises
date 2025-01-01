import { UserType } from "@/types/user";
import { Prisma, PrismaClient } from "@prisma/client";
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
                { address: { contains: search, mode: Prisma.QueryMode.insensitive} },
                { phone_number: { contains: search } }
            ]
        } : {};

        // Get total count for pagination
        const totalItems = await prisma.shop.count({
            where : whereClause
        });

        // Get paginated results
        const shops = await prisma.shop.findMany({
            where: whereClause,
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: {
                name: 'asc'
            }
        });

        const totalPages = Math.ceil(totalItems / pageSize);

        return NextResponse.json({
            shops,
            currentPage: page,
            totalPages,
            totalItems
        });
    } catch (e: any) {
        return NextResponse.json(
            { message: "Error fetching shops", error: e.message },
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
            { message: "Unauthorized: Only admin and manager can create shops" },
            { status: 401 }
        );
    }

    try {
        const body = await req.json();
        const { name, address, whatsapp_number, phone_number, lat, long } = body;
        // Validation
        if (!name || !address || !phone_number) {
            return NextResponse.json(
                { message: "Missing required fields: name, address, or phone number" },
                { status: 400 }
            );
        }

        // Create shop
        const newShop = await prisma.shop.create({
            data: {
                name,
                address,
                whatsapp_number,
                phone_number,
                lat,
                long,
            },
        });

        prisma.$disconnect();
        return NextResponse.json(
            { message: "Shop created successfully", shop: newShop },
            { status: 201 }
        );
    } catch (e: any) {
        prisma.$disconnect();
        return NextResponse.json(
            { message: "Error creating shop", error: e.message },
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
            { message: "Unauthorized: Only admin and manager can update shops" },
            { status: 401 }
        );
    }

    try {
        const body = await req.json();
        const { name, address, whatsapp_number, phone_number, lat, long } = body;
        const shopId = req.nextUrl.searchParams.get("id");

        if (!shopId) {
            return NextResponse.json(
                { message: "Shop ID is required" },
                { status: 400 }
            );
        }

        const currentShop = await prisma.shop.findUnique({
            where: { id: shopId }
        });

        if (!currentShop) {
            return NextResponse.json(
                { message: "Shop not found" },
                { status: 404 }
            );
        }

        // Update shop
        const updatedShop = await prisma.shop.update({
            where: { id: shopId },
            data: {
                name,
                address,
                whatsapp_number,
                phone_number,
                lat,
                long,
            },
        });

        prisma.$disconnect();
        return NextResponse.json(
            { message: "Shop updated successfully", shop: updatedShop },
            { status: 200 }
        );
    } catch (e: any) {
        prisma.$disconnect();
        return NextResponse.json(
            { message: "Error updating shop", error: e.message },
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
            { message: "Unauthorized: Only admin can delete shops" },
            { status: 401 }
        );
    }

    try {
        const shopId = req.nextUrl.searchParams.get("id");

        if (!shopId) {
            return NextResponse.json(
                { message: "Shop ID is required" },
                { status: 400 }
            );
        }

        const shop = await prisma.shop.findUnique({
            where: { id: shopId }
        });

        if (!shop) {
            return NextResponse.json(
                { message: "Shop not found" },
                { status: 404 }
            );
        }

        // Delete shop
        await prisma.shop.delete({
            where: { id: shopId }
        });

        prisma.$disconnect();
        return NextResponse.json(
            { message: "Shop deleted successfully" },
            { status: 200 }
        );
    } catch (e: any) {
        prisma.$disconnect();
        return NextResponse.json(
            { message: "Error deleting shop", error: e.message },
            { status: 500 }
        );
    }
}