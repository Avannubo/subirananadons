import NextAuth from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const { auth, handlers: { GET, POST } } = NextAuth(authOptions); 