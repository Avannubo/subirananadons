import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from "next/server";

export async function middleware(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // Check if the user is an admin
    if (!session.user.isAdmin) {
        return NextResponse.redirect(new URL("/not-authorized", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*"]
};