import { UserType } from "@/types/user";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const search = searchParams.get("search") || "";
    const userId = searchParams.get("userId") || "";

    try {
        let whereClause: any = {};
        if (search) {
            whereClause.route = {
                name: { contains: search, mode: 'insensitive' }
            };
        }
        if (userId) {
            whereClause.assigned_to = userId;
        }

        const totalItems = await prisma.trip.count({
            where: whereClause
        });

        const trips = await prisma.trip.findMany({
            where: whereClause,
            include: {
                route: true,
                trip_orders: {
                    include: {
                        order: true
                    },
                    orderBy: {
                        sequence_order: 'asc'
                    }
                }
            },
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: {
                created_at: 'desc'
            }
        });

        const totalPages = Math.ceil(totalItems / pageSize);

        return NextResponse.json({
            trips,
            currentPage: page,
            totalPages,
            totalItems
        });
    } catch (e: any) {
        return NextResponse.json(
            { message: "Error fetching trips", error: e.message },
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
            { message: "Unauthorized: Only admin and manager can create trips" },
            { status: 401 }
        );
    }

    try {
        const body = await req.json();
        const { route_id, assigned_to, orders , trip_date } = body;

        if (!route_id || !assigned_to) {
            return NextResponse.json(
                { message: "Route and assigned user are required" },
                { status: 400 }
            );
        }

        const newTrip = await prisma.trip.create({
            data: {
                route_id,
                assigned_to,
                trip_date,
                trip_orders: {
                    create: orders?.map((order: { order_id: string, sequence_order: number }) => ({
                        order_id: order.order_id,
                        sequence_order: order.sequence_order
                    })) || []
                }
            },
            include: {
                route: true,
                trip_orders: {
                    include: {
                        order: true
                    },
                    orderBy: {
                        sequence_order: 'asc'
                    }
                }
            }
        });

        return NextResponse.json(
            { message: "Trip created successfully", trip: newTrip },
            { status: 201 }
        );
    } catch (e: any) {
        return NextResponse.json(
            { message: "Error creating trip", error: e.message },
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
            { message: "Unauthorized: Only admin and manager can update trips" },
            { status: 401 }
        );
    }

    try {
        const body = await req.json();
        const { route_id, assigned_to, orders , trip_date } = body;
        const tripId = req.nextUrl.searchParams.get("id");

        if (!tripId) {
            return NextResponse.json(
                { message: "Trip ID is required" },
                { status: 400 }
            );
        }

        const updatedTrip = await prisma.$transaction(async (tx) => {
            // Delete existing trip_orders
            await tx.tripHasOrders.deleteMany({
                where: { trip_id: tripId }
            });

            // Update trip and create new trip_orders
            return tx.trip.update({
                where: { id: tripId },
                data: {
                    route_id,
                    assigned_to,
                    trip_date,
                    trip_orders: {
                        create: orders?.map((order: { order_id: string, sequence_order: number }) => ({
                            order_id: order.order_id,
                            sequence_order: order.sequence_order
                        })) || []
                    }
                },
                include: {
                    route: true,
                    trip_orders: {
                        include: {
                            order: true
                        },
                        orderBy: {
                            sequence_order: 'asc'
                        }
                    }
                }
            });
        });

        return NextResponse.json(
            { message: "Trip updated successfully", trip: updatedTrip },
            { status: 200 }
        );
    } catch (e: any) {
        return NextResponse.json(
            { message: "Error updating trip", error: e.message },
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
            { message: "Unauthorized: Only admin can delete trips" },
            { status: 401 }
        );
    }

    try {
        const tripId = req.nextUrl.searchParams.get("id");

        if (!tripId) {
            return NextResponse.json(
                { message: "Trip ID is required" },
                { status: 400 }
            );
        }

        await prisma.$transaction(async (tx) => {
            // Delete associated trip_orders first
            await tx.tripHasOrders.deleteMany({
                where: { trip_id: tripId }
            });

            // Delete the trip
            await tx.trip.delete({
                where: { id: tripId }
            });
        });

        return NextResponse.json(
            { message: "Trip deleted successfully" },
            { status: 200 }
        );
    } catch (e: any) {
        return NextResponse.json(
            { message: "Error deleting trip", error: e.message },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}