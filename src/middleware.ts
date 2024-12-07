
import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';


export async function middleware( req : NextRequest ) {
    try{
      //check if there is a token in the request header
      const token = req.headers.get("Authorization");

      if(token){
          const user = await jose.jwtVerify(token.replace("Bearer ",""),new TextEncoder().encode(process.env.JOSE_SECRET));
          
          if(user){
            req.headers.set("user",JSON.stringify(user.payload));
          }
      }
      //add all data of the request and send it to the next middleware
    }catch(e){
        console.log(e);
    }

    return NextResponse.next({
        request: req
    });
}

// Apply the middleware to all API routes
export const config = {
    matcher: ['/api/:path*']
};