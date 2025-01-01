import { UserType } from "@/types/user";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    const userHeader = req.headers.get("user");
    const user: UserType | null = userHeader ? JSON.parse(userHeader) : null;

    if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

    try {
        const totalItems = await prisma.batch.count();

        const batches = await prisma.batch.findMany({
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: {
                product: {
                    select: {
                        name: true,
                        uom: true
                    }
                }
            }
        });

        // Transform the data to include product_name
        const transformedBatches = batches.map(batch => ({
            ...batch,
            product_name: batch.product.name,
        }));

        const totalPages = Math.ceil(totalItems / pageSize);

        return NextResponse.json({
            message: "Batches found",
            batches: transformedBatches,
            pagination: {
                currentPage: page,
                pageSize,
                totalItems,
                totalPages
            }
        });
    } catch (e: any) {
        return NextResponse.json(
            { message: "Error fetching batches", error: e },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}


export async function POST(req: NextRequest) {
    const userHeader = req.headers.get("user");
    const user: UserType | null = userHeader ? JSON.parse(userHeader) : null;

    if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.role !== "admin" && user.role !== "manager") {
        return NextResponse.json(
            { message: "Unauthorized: Only admin and manager can create batches" },
            { status: 401 }
        );
    }

    try {
        const body = await req.json();
        const {
            product_key,
            uom,
            packs,
            loose,
            mfd,
            exp,
            cost,
            labeled_price,
            purchase_invoice_id,
            addedBy,
            totalQuantity
        } = body;

        // Validation
        if (!product_key || !uom || !packs || !loose || !mfd || !exp || !cost || !labeled_price || !purchase_invoice_id || !addedBy) {
            return NextResponse.json(
                {
                    message: "Missing required fields",
                },
                { status: 400 }
            );
        }

        // Start a transaction to ensure both operations succeed or fail together
        const result = await prisma.$transaction(async (prisma) => {
            // Create batch
            const batch = await prisma.batch.create({
                data: {
                    product_key,
                    uom,
                    packs,
                    loose,
                    mfd: new Date(mfd),
                    exp: new Date(exp),
                    cost,
                    labeled_price,
                    purchase_invoice_id,
                    addedBy
                }
            });

            // Update product stock
            const product = await prisma.product.update({
                where: {
                    key: product_key
                },
                data: {
                    stock: {
                        increment: totalQuantity
                    }
                }
            });

            return { batch, product };
        });

        return NextResponse.json({ 
            message: "Batch created and stock updated", 
            batch: result.batch,
            product: result.product
        });

    } catch (e: any) {
        return NextResponse.json(
            { message: "Error creating batch", error: e },
            { status: 500 }
        );
    }
}


export async function PUT(req: NextRequest) {
    const userHeader = req.headers.get("user");
    const batchId = req.nextUrl.searchParams.get("batch_id");
    const user: UserType | null = userHeader ? JSON.parse(userHeader) : null;

    if (!user || !batchId || isNaN(Number(batchId))) {
        return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    try {
        const body = await req.json();
        const {
            product_key,
            uom,
            packs,
            loose,
            mfd,
            exp,
            cost,
            labeled_price,
            purchase_invoice_id,
            addedBy,
            totalQuantity
        } = body;

        // Start a transaction
        const result = await prisma.$transaction(async (prisma) => {
            // Get the old batch to calculate stock difference
            const oldBatch = await prisma.batch.findUnique({
                where: { batch_id: parseInt(batchId) }
            });

            if (!oldBatch) {
                throw new Error("Batch not found");
            }

            const oldTotalQuantity = (oldBatch.uom * oldBatch.packs) + oldBatch.loose;
            const stockDifference = totalQuantity - oldTotalQuantity;

            // Update batch
            const batch = await prisma.batch.update({
                where: { batch_id: parseInt(batchId) },
                data: {
                    product_key,
                    uom,
                    packs,
                    loose,
                    mfd: new Date(mfd),
                    exp: new Date(exp),
                    cost,
                    labeled_price,
                    purchase_invoice_id,
                    addedBy
                }
            });

            // Update product stock
            const product = await prisma.product.update({
                where: {
                    key: product_key
                },
                data: {
                    stock: {
                        increment: stockDifference
                    }
                }
            });

            return { batch, product };
        });

        return NextResponse.json({ 
            message: "Batch and stock updated successfully", 
            batch: result.batch,
            product: result.product
        });

    } catch (e: any) {
        return NextResponse.json(
            { message: "Error updating batch: " + e.message, error: e },
            { status: 500 }
        );
    }
}


export async function DELETE(req: NextRequest) {
    const userHeader = req.headers.get("user");
    const batchId = req.nextUrl.searchParams.get("batch_id");
    const user: UserType | null = userHeader ? JSON.parse(userHeader) : null;

    if (!user || !batchId || isNaN(Number(batchId))) {
        return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    try {
        const result = await prisma.$transaction(async (prisma) => {
            // Get the batch to be deleted
            const batchToDelete = await prisma.batch.findUnique({
                where: { batch_id: parseInt(batchId) }
            });

            if (!batchToDelete) {
                throw new Error("Batch not found");
            }

            // Calculate quantity to decrease
            const quantityToDecrease = (batchToDelete.uom * batchToDelete.packs) + batchToDelete.loose;

            // Delete batch
            const batch = await prisma.batch.delete({
                where: { batch_id: parseInt(batchId) }
            });

            // Update product stock
            const product = await prisma.product.update({
                where: {
                    key: batchToDelete.product_key
                },
                data: {
                    stock: {
                        decrement: quantityToDecrease
                    }
                }
            });

            return { batch, product };
        });

        return NextResponse.json({ 
            message: "Batch deleted and stock updated", 
            batch: result.batch,
            product: result.product
        });

    } catch (e: any) {
        return NextResponse.json(
            { message: "Error deleting batch: " + e.message, error: e },
            { status: 500 }
        );
    }
}
