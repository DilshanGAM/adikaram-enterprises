import { UserType } from "@/types/user";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
	let userHeader = req.headers.get("user");
	let user: UserType | null = userHeader ? JSON.parse(userHeader) : null;
	if (!user) {
		return NextResponse.json({ message: "User not found" }, { status: 404 });
	}

	const products = await prisma.product.findMany();
	prisma.$disconnect();
	return NextResponse.json({ message: "Products found", products });
}

export async function POST(req: NextRequest) {
	const userHeader = req.headers.get("user");
	const user: UserType | null = userHeader ? JSON.parse(userHeader) : null;

	if (!user) {
		return NextResponse.json({ message: "User not found" }, { status: 404 });
	}

	if (user.role !== "admin" && user.role !== "manager") {
		return NextResponse.json(
			{ message: "Unauthorized: Only admin and manager can create accounts" },
			{ status: 401 }
		);
	}

	try {
		const body = await req.json();

		const {
			key,
			name,
			stock,
			container_type,
			uom,
			volume,
			flavour,
			default_labeled_price,
			default_cost,
			product_image,
			status,
		} = body;

		// Validation
		if (
			!key ||
			!name ||
			!stock ||
			!container_type ||
			!uom ||
			!volume ||
			!flavour ||
			!default_labeled_price ||
			!default_cost ||
			!product_image ||
			!status
		) {
			return NextResponse.json(
				{
					message:
						"Missing required fields: key, name, stock, container_type, uom, volume, flavor, default_labeled_price, default_cost, product_image, or status",
				},
				{ status: 400 }
			);
		}

		// Create product
		const product = await prisma.product.create({
			data: {
				key,
				name,
				stock,
				container_type,
				uom,
				volume,
				flavour,
				default_labeled_price,
				default_cost,
				product_image,
				status,
			},
		});

		return NextResponse.json({ message: "Product created", product });
	} catch (e: any) {
        if(e.message.includes("Unique constraint failed on the fields: (`key`)")){
            return NextResponse.json(
                { message: "Product key already exists try using different product key", error: e },
                { status: 400 }
            );
        }
		return NextResponse.json(
			{ message: "Error creating product", error: e },
			{ status: 500 }
		);
	}
}

export async function PUT(req: NextRequest) {
    const userHeader = req.headers.get("user");
    const productKey = req.nextUrl.searchParams.get("key");
    const user: UserType | null = userHeader ? JSON.parse(userHeader) : null;

    if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.role !== "admin") {
        return NextResponse.json(
            { message: "Unauthorized: Only admin can update products" },
            { status: 401 }
        );
    }

    try {
        const body = await req.json();

        const {
            key,
            name,
            stock,
            container_type,
            uom,
            volume,
            flavour,
            default_labeled_price,
            default_cost,
            product_image,
            status,
        } = body;

        // Validation
        if (
            !key ||
            !name ||
            !stock ||
            !container_type ||
            !uom ||
            !volume ||
            !flavour ||
            !default_labeled_price ||
            !default_cost ||
            !product_image ||
            !status
        ) {
            return NextResponse.json(
                {
                    message:
                        "Missing required fields: key, name, stock, container_type, uom, volume, flavor, default_labeled_price, default_cost, product_image, or status",
                },
                { status: 400 }
            );
        }

        // Update product
        const product = await prisma.product.update({
            where: { key : productKey||"" },
            data: {
                name,
                stock,
                container_type,
                uom,
                volume,
                flavour,
                default_labeled_price,
                default_cost,
                product_image,
                status,
            },
        });

        return NextResponse.json({ message: "Product updated", product });
    } catch (e: any) {
        return NextResponse.json(
            { message: "Error updating product " + e.message, error: e },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    const userHeader = req.headers.get("user");
    const productKey = req.nextUrl.searchParams.get("key");
    const user: UserType | null = userHeader ? JSON.parse(userHeader) : null;

    if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.role !== "admin") {
        return NextResponse.json(
            { message: "Unauthorized: Only admin can delete products" },
            { status: 401 }
        );
    }

    try {
        // Delete product
        const product = await prisma.product.delete({
            where: { key : productKey||"" },
        });

        return NextResponse.json({ message: "Product deleted", product });
    } catch (e: any) {
        return NextResponse.json(
            { message: "Error deleting product", error: e },
            { status: 500 }
        );
    }
}
