import { User } from '@/models/User'; 

export async function createUser(user) { 
    try {
        const user = await User(user);
        await user.save(); 
    } catch (error) {
        throw new Error('Error registering user');
    }
}

//make one for login and one for register
export async function getUserByEmail(email) {
    try {
        const user = await User.findOne({ email });
        return user;
    } catch (error) {
        throw new Error('Error fetching user by email');
    }
}

// auth a user by email and password
export async function authenticateUser(email, password) {
    try {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw new Error('Invalid password');
        }

        return user;
    } catch (error) {
        throw new Error('Error authenticating user');
    }
}