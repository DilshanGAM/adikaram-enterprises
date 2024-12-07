import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as jose from "jose";

import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
	const { email, password } = await req.json();
	const user = await prisma.user.findFirst({
		where: {
			email: email,
		},
	});

	//check for password
	if (user) {
		const match = await bcrypt.compare(password, user.password);
		if (match) {
			//generate jwt
            if(user.status !== "active"){
                return NextResponse.json({message: "Account is in "+user.status+" mode. Please contact the admin!", status: 401});
            }
			const payload = {
				email: user.email,
				name: user.name,
				phone: user.phone,
				title: user.title,
				whatsapp: user.whatsapp,
				role: user.role
			};
			const token = await new jose.SignJWT(payload)
				.setProtectedHeader({ alg: "HS256" })
                .setExpirationTime("48h")
				.sign(new TextEncoder().encode(process.env.JOSE_SECRET));

			return NextResponse.json({ token , user : payload , message: "Login successful"}, {status: 200});
		}else{
            return NextResponse.json({message: "Invalid password"},{ status: 401});
        }
	}else{
        return NextResponse.json({message: "User not found"}, {status: 404});
    }
}
