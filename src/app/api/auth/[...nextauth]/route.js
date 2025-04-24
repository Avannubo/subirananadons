import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import dbConnect from '@/lib/dbConnect';
import { headers } from 'next/headers';
import { trackUserSession, invalidateSession } from '@/lib/auth/sessionTracker';

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Please enter an email and password');
                }

                await dbConnect();

                const user = await User.findOne({ email: credentials.email }).select('+password');
                if (!user) {
                    throw new Error('No user found with this email');
                }

                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
                if (!isPasswordValid) {
                    throw new Error('Invalid password');
                }

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    role: user.role
                };
            }
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.role = token.role;

                // Get request headers - Fix by awaiting the headers() function
                try {
                    // Use await with headers() since it's an async API in Next.js 13+
                    const headersList = await headers();
                    const userAgent = headersList.get('user-agent') || '';
                    const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0] ||
                        headersList.get('x-real-ip') ||
                        'unknown';

                    // Track the session
                    try {
                        await trackUserSession(
                            token.id,
                            session.sessionToken || token.jti,
                            userAgent,
                            ipAddress
                        );
                    } catch (error) {
                        console.error('Error tracking session:', error);
                    }
                } catch (error) {
                    console.error('Error accessing headers:', error);
                    // Continue even if headers access fails
                }
            }
            return session;
        }
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
    session: {
        strategy: 'jwt'
    },
    secret: process.env.NEXTAUTH_SECRET
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };