import NextAuth from 'next-auth';
import authConfig from '@/auth.config';

const { auth, handlers } = NextAuth(authConfig);

export { auth, handlers as GET, handlers as POST };