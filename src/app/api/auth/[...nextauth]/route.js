import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { headers } from 'next/headers';
import { trackUserSession, invalidateSession } from '@/lib/auth/sessionTracker';

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
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

                    // Update last login timestamp
                    await User.findByIdAndUpdate(user._id, {
                        lastLogin: new Date()
                    });

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
                            role: 'user',
                            provider: 'google'
                        });
                    }

                    // Update last login timestamp
                    await User.findByIdAndUpdate(dbUser._id, {
                        lastLogin: new Date()
                    });

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

                // Get request headers
                const headersList = headers();
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
            }
            return session;
        }
    },
    events: {
        async signOut({ token }) {
            try {
                // Invalidate the session in the database
                if (token?.jti) {
                    await invalidateSession(token.jti);
                }
            } catch (error) {
                console.error('Error handling signOut:', error);
            }
        }
    },
    pages: {
        signIn: '/',
        error: '/',
    },
    debug: process.env.NODE_ENV === 'development'
});

export { handler as GET, handler as POST };