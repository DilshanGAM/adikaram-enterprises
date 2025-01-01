// /api/orders/route.ts
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
const prisma = new PrismaClient();


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId } = body;

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { shop: true }
      });

      if (!order) {
        throw new Error('Order not found');
      }

      if (order.payment_type === 'cash') {
        throw new Error('Order is already marked as cash payment');
      }

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { 
          payment_type: 'cash',
          status: 'complete'  
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
          type: 'credit'  
        }
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