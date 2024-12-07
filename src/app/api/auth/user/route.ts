import { NextRequest, NextResponse } from "next/server";

export function GET(req: NextRequest) {
    const user = req.headers.get("user");

    if(!user){
        return NextResponse.json({message: "User not found"}, {status: 404});
    }else{
        return NextResponse.json({message: "User Found", user: JSON.parse(user) });
    }
}

