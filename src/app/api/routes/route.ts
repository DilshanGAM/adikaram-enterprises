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
        const whereClause = search ? {
            name: { contains: search, mode: Prisma.QueryMode.insensitive }
        } : {};

        const totalItems = await prisma.route.count({
            where: whereClause
        });

        const routes = await prisma.route.findMany({
            where: whereClause,
            include: {
                route_shops: {
                    include: {
                        shop: true
                    },
                    orderBy: {
                        sequence_order: 'asc'
                    }
                }
            },
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: {
                name: 'asc'
            }
        });

        const totalPages = Math.ceil(totalItems / pageSize);

        return NextResponse.json({
            routes,
            currentPage: page,
            totalPages,
            totalItems
        });
    } catch (e: any) {
        return NextResponse.json(
            { message: "Error fetching routes", error: e.message },
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
            { message: "Unauthorized: Only admin and manager can create routes" },
            { status: 401 }
        );
    }

    try {
        const body = await req.json();
        const { name, shops } = body;

        if (!name) {
            return NextResponse.json(
                { message: "Route name is required" },
                { status: 400 }
            );
        }

        if (!shops || !Array.isArray(shops) || shops.length === 0) {
            return NextResponse.json(
                { message: "At least one shop is required for the route" },
                { status: 400 }
            );
        }

        const newRoute = await prisma.route.create({
            data: {
                name,
                route_shops: {
                    create: shops.map((shop: { shop_id: string, sequence_order: number }) => ({
                        shop_id: shop.shop_id,
                        sequence_order: shop.sequence_order
                    }))
                }
            },
            include: {
                route_shops: {
                    include: {
                        shop: true
                    },
                    orderBy: {
                        sequence_order: 'asc'
                    }
                }
            }
        });

        return NextResponse.json(
            { message: "Route created successfully", route: newRoute },
            { status: 201 }
        );
    } catch (e: any) {
        return NextResponse.json(
            { message: "Error creating route", error: e.message },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
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
            { message: "Unauthorized: Only admin and manager can update routes" },
            { status: 401 }
        );
    }

    try {
        const body = await req.json();
        const { name, shops } = body;
        const routeId = req.nextUrl.searchParams.get("id");

        if (!routeId) {
            return NextResponse.json(
                { message: "Route ID is required" },
                { status: 400 }
            );
        }

        const currentRoute = await prisma.route.findUnique({
            where: { id: routeId }
        });

        if (!currentRoute) {
            return NextResponse.json(
                { message: "Route not found" },
                { status: 404 }
            );
        }

        // Delete existing route_shops and create new ones in a transaction
        const updatedRoute = await prisma.$transaction(async (tx) => {
            // Delete existing route_shops
            await tx.routeHasShops.deleteMany({
                where: { route_id: routeId }
            });

            // Update route and create new route_shops
            return tx.route.update({
                where: { id: routeId },
                data: {
                    name,
                    route_shops: {
                        create: shops.map((shop: { shop_id: string, sequence_order: number }) => ({
                            shop_id: shop.shop_id,
                            sequence_order: shop.sequence_order
                        }))
                    }
                },
                include: {
                    route_shops: {
                        include: {
                            shop: true
                        },
                        orderBy: {
                            sequence_order: 'asc'
                        }
                    }
                }
            });
        });

        return NextResponse.json(
            { message: "Route updated successfully", route: updatedRoute },
            { status: 200 }
        );
    } catch (e: any) {
        return NextResponse.json(
            { message: "Error updating route", error: e.message },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
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
            { message: "Unauthorized: Only admin can delete routes" },
            { status: 401 }
        );
    }

    try {
        const routeId = req.nextUrl.searchParams.get("id");

        if (!routeId) {
            return NextResponse.json(
                { message: "Route ID is required" },
                { status: 400 }
            );
        }

        // Delete route and associated route_shops in a transaction
        await prisma.$transaction(async (tx) => {
            // Delete associated route_shops first
            await tx.routeHasShops.deleteMany({
                where: { route_id: routeId }
            });

            // Delete the route
            await tx.route.delete({
                where: { id: routeId }
            });
        });

        return NextResponse.json(
            { message: "Route deleted successfully" },
            { status: 200 }
        );
    } catch (e: any) {
        return NextResponse.json(
            { message: "Error deleting route", error: e.message },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}