// /api/orders/route.ts
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { shopId, products, totalAmount, discount , tripId , type , payment_type } = await req.json();

    if (!shopId || !products || !totalAmount || !tripId || !type || !payment_type) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const order = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          discount: discount,
          shop_id: shopId,
          total_amount: totalAmount,
          payment_type : payment_type,
          status: "paid",
          type: type,
        },
      });

      if(payment_type == "cash"){
       // Create the transaction
       await tx.transaction.create({
        data: {
          order_id: order.id,
          shop_id: shopId,
          amount: totalAmount,
          date_created: new Date(),
          date_paid: new Date(), 
          payment_method: "cash", 
          type: type, 
        },
      });
      }


      // Create TripHasOrders
      if (tripId) {
        const trip = await tx.trip.findUnique({
          where: { id: tripId },
          include: { route: true },
        });

        if (trip) {
          await tx.tripHasOrders.create({
            data: {
              trip_id: tripId,
              order_id: order.id,
              route_id: trip.route_id,
              shop_id: shopId,
              sequence_order: 1,
            },
          });
        }
      }

      // Create order products and update stock
      for (const product of products) {
        await tx.orderHasProducts.create({
          data: {
            order_id: order.id,
            product_id: product.productId,
          },
        });

        if ( type == "credit") {
          await tx.product.update({
            where: { key: product.productId },
            data: {
              stock: { decrement: product.quantity },
            },
          });
        }else {
          await tx.product.update({
            where: { key: product.productId },
            data: {
              stock: { increment: product.quantity },
            },
          });
        }
      }

      return order;
    });

    return NextResponse.json({ message: "Order created successfully", order });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const shopId = searchParams.get("shopId");
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");

  try {
    const whereClause = shopId ? { shop_id: shopId } : {};

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
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
