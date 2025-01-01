import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        // Get total counts
        const [totalOrders, totalProducts, totalShops, totalRoutes] = await Promise.all([
            prisma.order.count(),
            prisma.product.count(),
            prisma.shop.count(),
            prisma.route.count()
        ]);

        // Get recent sales (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentSales = await prisma.order.groupBy({
            by: ['created_at'],
            where: {
                created_at: {
                    gte: sevenDaysAgo
                },
            },
            _sum: {
                total_amount: true
            }
        });

        // Get top performing products
        const productPerformance = await prisma.orderHasProducts.groupBy({
            by: ['product_id'],
            _count: {
                product_id: true
            },
            take: 5,
            orderBy: {
                _count: {
                    product_id: 'desc'
                }
            }
        });

        // Get product names
        const productIds = productPerformance.map(p => p.product_id);
        const products = await prisma.product.findMany({
            where: {
                key: {
                    in: productIds
                }
            }
        });

        return NextResponse.json({
            stats: {
                totalOrders,
                totalProducts,
                totalShops,
                totalRoutes
            },
            recentSales: recentSales.map(sale => ({
                date: sale.created_at.toISOString().split('T')[0],
                amount: sale._sum.total_amount || 0
            })),
            productPerformance: productPerformance.map(perf => ({
                name: products.find(p => p.key === perf.product_id)?.name || 'Unknown',
                sales: perf._count.product_id
            }))
        });
    } catch (e: any) {
        return NextResponse.json(
            { message: "Error fetching dashboard data", error: e.message },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}