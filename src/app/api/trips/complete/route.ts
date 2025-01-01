import { UserType } from "@/types/user";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function PUT(req: NextRequest) {
    const userHeader = req.headers.get("user");
    const user: UserType | null = userHeader ? JSON.parse(userHeader) : null;

    if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.role !== "staff") {
        return NextResponse.json(
            { message: "Unauthorized: Only Staff and End Trip" },
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

        const body = await req.json();
        const { is_completed } = body;

        if (typeof is_completed !== 'boolean') {
            return NextResponse.json(
                { message: "is_verified must be a boolean value" },
                { status: 400 }
            );
        }

        const updatedTrip = await prisma.trip.update({
            where: { id: tripId },
            data: {
                is_completed,
                verified_by: is_completed ? user.email : null
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
            { 
                message: `Trip ${is_completed ? 'Ended' : 'Failed'} successfully`, 
                trip: updatedTrip 
            },
            { status: 200 }
        );
    } catch (e: any) {
        return NextResponse.json(
            { message: "Error updating trip status", error: e.message },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}