// /api/transactions/pdf/route.ts
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        shop: {
          select: {
            name: true,
            address: true,
            phone_number: true,
            whatsapp_number: true,
          },
        },
      },
      orderBy: { date_created: "desc" },
    });

    return NextResponse.json({ transactions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}