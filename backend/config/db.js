const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
            connectTimeoutMS: 10000, // Fail fast on initial connect
            maxPoolSize: 10, // Maximum number of connections in the connection pool
            retryWrites: true,
            w: 'majority'
        });
        
        console.log(`MongoDB connected successfully to ${conn.connection.host}`);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        
        // Provide more detailed error information
        if (error.name === 'MongooseServerSelectionError') {
            console.error('Server Selection Error: This is typically a network or DNS issue.');
            console.error('Please check:');
            console.error('1. Your internet connection');
            console.error('2. If your IP is whitelisted in MongoDB Atlas');
            console.error('3. If the connection string is correct');
        } else if (error.name === 'MongoNetworkError') {
            console.error('Network Error: Could not establish connection to MongoDB.');
        } else if (error.name === 'MongooseError') {
            console.error('Mongoose Error:', error.message);
        }
        
        process.exit(1);
    }
};

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to DB');});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');});

// Close the Mongoose connection when the Node process ends
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('Mongoose connection closed through app termination');
    process.exit(0);
});

module.exports = connectDB;