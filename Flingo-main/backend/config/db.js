import mongoose from 'mongoose';
import dns from 'dns';

// Set public DNS servers to prevent querySrv ECONNREFUSED on Windows/local networks
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  // Ignore if not supported in environment
}

const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/flingo';
  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.warn(`Please make sure MongoDB is running or configure a valid MONGO_URI in backend/.env`);
  }
};

export default connectDB;
