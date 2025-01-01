// /api/orders/route.ts
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
const prisma = new PrismaClient();


export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const shopId = searchParams.get("shopId");

  try {
    const whereClause = {
      status: { not: "returned" },
      ...(shopId ? { shop_id: shopId } : {})
    };

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        shop: true,
        order_products: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}