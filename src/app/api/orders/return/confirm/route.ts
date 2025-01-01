import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
const prisma = new PrismaClient();


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId , tripId } = body;

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { shop: true }
      });

      if (!order) {
        throw new Error('Order not found');
      }

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { 
          payment_type: 'cash',
          status: 'returned'  
        }
      });

      const transaction = await tx.transaction.create({
        data: {
          order_id: order.id,
          shop_id: order.shop_id,
          amount: order.total_amount,
          date_created: new Date(),
          date_paid: new Date(),  
          payment_method: "cash",
          type: 'debit'  
        }
      });

      const returnOrder = await tx.order.create({
        data: {
          discount: order.discount,
          shop_id: order.shop_id,
          total_amount: order.total_amount,
          payment_type : "cash",
          status: "paid",
          type: "debit",
        },
      });

      const trip = await tx.trip.findUnique({
        where: { id: tripId },
        include: { route: true },
      });

      if (!trip) {
        throw new Error('Trip not found');
      }

      //create TripHasOrders
      await tx.tripHasOrders.create({
        data: {
          trip_id: tripId,
          order_id: returnOrder.id,
          route_id: trip.route_id,
          shop_id: returnOrder.shop_id,
          sequence_order: 1,
        },
      });

      return { updatedOrder, transaction };
    });

    return NextResponse.json({ 
      message: 'Order confirmed successfully',
      data: result 
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message }, 
      { status: error.message === 'Order not found' ? 404 : 500 }
    );
  }
}