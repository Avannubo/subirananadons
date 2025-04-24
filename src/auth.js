import NextAuth from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Export the auth function only, not the handlers
export const { auth } = NextAuth(authOptions); 