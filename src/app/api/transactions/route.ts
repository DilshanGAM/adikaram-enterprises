// /api/transactions/route.ts
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    // Get filter parameters
    const shopId = searchParams.get("shopId");
    const type = searchParams.get("type");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Pagination parameters
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    // Build where clause based on filters
    const whereClause: any = {};

    if (shopId) {
      whereClause.shop_id = shopId;
    }

    if (type) {
      whereClause.type = type;
    }

    // Add date range filter if provided
    if (startDate || endDate) {
      whereClause.date_created = {};

      if (startDate) {
        whereClause.date_created.gte = new Date(startDate);
      }

      if (endDate) {
        whereClause.date_created.lte = new Date(endDate);
      }
    }

    // Get total count for pagination
    const totalCount = await prisma.transaction.count({
      where: whereClause,
    });

    // Get transactions with filters and pagination
    const transactions = await prisma.transaction.findMany({
      where: whereClause,
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
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { date_created: "desc" },
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / pageSize);

    return NextResponse.json({
      transactions,
      currentPage: page,
      pageSize,
      totalPages,
      totalCount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
