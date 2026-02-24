
import { connectToDatabase } from '@/lib/db';
import User from '@/lib/db/models/user.model';

async function verifyConnection() {
    try {
        console.log('Attempting to connect to MongoDB...');
        await connectToDatabase();
        console.log('Creates connection successfully!');

        const userCount = await User.countDocuments();
        console.log(`Connection successful! Found ${userCount} users in the database.`);
        process.exit(0);
    } catch (error) {
        console.error('Connection failed:', error);
        process.exit(1);
    }
}

verifyConnection();
