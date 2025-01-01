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
        name: { contains: search, mode: "insensitive" },
      };
    }
    whereClause.assigned_to = userId;
 
    const totalItems = await prisma.trip.count({
      where: whereClause,
    });
 
    const trips = await prisma.trip.findMany({
      where: whereClause,
      include: {
        route: {
          include: {
            route_shops: {
              include: {
                shop: {
                  include: {
                    orders: {
                      include: {
                        trip_orders: {
                          where: {
                            is_visited: true
                          }
                        }
                      }
                    }
                  }
                },
              },
              orderBy: {
                sequence_order: "asc",
              },
            },
          },
        },
        trip_orders: {
          include: {
            order: true,
          },
          orderBy: {
            sequence_order: "asc",
          },
        },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        created_at: "desc",
      },
    });
 
    // Transform the data to add visited flag
    const transformedTrips = trips.map(trip => ({
      ...trip,
      route: {
        ...trip.route,
        route_shops: trip.route.route_shops.map(rs => ({
          ...rs,
          shop: {
            ...rs.shop,
            visited: rs.shop.orders.some(order => 
              order.trip_orders.some(to => to.is_visited)
            )
          }
        }))
      }
    }));
 
    return NextResponse.json({
      trips: transformedTrips,
      currentPage: page,
      totalPages: Math.ceil(totalItems / pageSize),
      totalItems,
    });
  } catch (e: any) {
    return NextResponse.json(
      { message: "Error fetching trips", error: e.message },
      { status: 500 }
    );
  }
 }