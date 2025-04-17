import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { headers } from 'next/headers';

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    await dbConnect();

                    // Check if all credentials are provided
                    if (!credentials?.email || !credentials?.password) {
                        throw new Error('Please provide all required fields');
                    }

                    // Find user and explicitly select password
                    const user = await User.findOne({ email: credentials.email }).select('+password');
                    if (!user) {
                        throw new Error('No user found with this email');
                    }

                    // Verify password
                    const isValid = await bcrypt.compare(credentials.password, user.password);
                    if (!isValid) {
                        throw new Error('Invalid password');
                    }

                    // Return user object without sensitive data
                    return {
                        id: user._id.toString(),
                        email: user.email,
                        name: user.name,
                        role: user.role || 'user'
                    };
                } catch (error) {
                    console.error('Auth error:', error);
                    throw new Error(error.message || 'Authentication failed');
                }
            }
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: {
                    prompt: "select_account"
                }
            }
        })
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        updateAge: 24 * 60 * 60, // 24 hours
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "credentials") {
                return true;
            }
            if (account?.provider === "google") {
                try {
                    await dbConnect();

                    // Check if user exists
                    let dbUser = await User.findOne({ email: profile.email });

                    // If not, create new user
                    if (!dbUser) {
                        dbUser = await User.create({
                            email: profile.email,
                            name: profile.name,
                            role: 'user'
                        });
                    }

                    return true;
                } catch (error) {
                    console.error('SignIn callback error:', error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user, account }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.role = token.role;
                session.user.id = token.id;
            }
            return session;
        }
    },
    pages: {
        signIn: '/',
        error: '/',
    },
    debug: process.env.NODE_ENV === 'development'
});

export { handler as GET, handler as POST };