import Session from '@/models/Session';
import dbConnect from '@/lib/dbConnect';

export async function trackUserSession(userId, sessionToken, userAgent, ipAddress) {
    try {
        await dbConnect();

        // Create new session record
        const session = await Session.create({
            userId,
            accessToken: sessionToken,
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            userAgent,
            ipAddress,
            isValid: true
        });

        return session;
    } catch (error) {
        console.error('Error tracking session:', error);
        throw error;
    }
}

export async function invalidateSession(sessionToken) {
    try {
        await dbConnect();

        await Session.findOneAndUpdate(
            { accessToken: sessionToken },
            { isValid: false }
        );
    } catch (error) {
        console.error('Error invalidating session:', error);
        throw error;
    }
}

export async function updateLastActivity(sessionToken) {
    try {
        await dbConnect();

        await Session.findOneAndUpdate(
            { accessToken: sessionToken },
            { lastActivity: new Date() }
        );
    } catch (error) {
        console.error('Error updating session activity:', error);
        throw error;
    }
} 