import Session from '@/models/Session';
import { getServerSession } from 'next-auth';

export function MongoDBSessionAdapter() {
    return {
        async createSession(session) {
            const newSession = await Session.create({
                userId: session.userId,
                accessToken: session.sessionToken,
                expires: session.expires,
                userAgent: session?.userAgent,
                ipAddress: session?.ipAddress
            });
            return {
                sessionToken: newSession.accessToken,
                userId: newSession.userId,
                expires: newSession.expires
            };
        },

        async getSession(sessionToken) {
            const session = await Session.findOne({
                accessToken: sessionToken,
                isValid: true,
                expires: { $gt: new Date() }
            });

            if (!session) return null;

            // Update last activity
            await Session.updateOne(
                { _id: session._id },
                { $set: { lastActivity: new Date() } }
            );

            return {
                sessionToken: session.accessToken,
                userId: session.userId,
                expires: session.expires
            };
        },

        async updateSession(session, force) {
            const updatedSession = await Session.findOneAndUpdate(
                { accessToken: session.sessionToken },
                {
                    $set: {
                        expires: session.expires,
                        lastActivity: new Date()
                    }
                },
                { new: true }
            );

            return {
                sessionToken: updatedSession.accessToken,
                userId: updatedSession.userId,
                expires: updatedSession.expires
            };
        },

        async deleteSession(sessionToken) {
            await Session.updateOne(
                { accessToken: sessionToken },
                { $set: { isValid: false } }
            );
            return;
        }
    };
}

// Helper function to get current session with full details
export async function getFullSession(req) {
    const session = await getServerSession(req);
    if (!session) return null;

    const dbSession = await Session.findOne({
        accessToken: session.sessionToken,
        isValid: true
    }).populate('userId');

    return dbSession;
} 