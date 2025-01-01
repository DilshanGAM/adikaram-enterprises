import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
const prisma = new PrismaClient();


export async function POST(req: NextRequest) {
    try {
      const { shopId , tripId } = await req.json();

  
      if (!tripId) {
        return NextResponse.json({ message: "No active trip found for this shop" }, { status: 404 });
      }
  
      const result = await prisma.tripHasOrders.updateMany({
        where: {
          trip_id: tripId,
          order: {
            shop_id: shopId,
          },
        },
        data: {
          is_visited: true,
          visited_at: new Date(),
        },
      });
  
      if(result.count === 0) {
        return NextResponse.json({ message: "Shop not found in the active trip" }, { status: 404 });
      }

      return NextResponse.json({ message: "Shop visit recorded successfully" });
  
    } catch (e: any) {
      console.error("Error recording shop visit:", e);
      return NextResponse.json({ message: "Error recording shop visit", error: e.message }, { status: 500 });
    }
  }