import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn("WARNING: MONGODB_URI is not defined in .env file.");
}

const connectDB = async (): Promise<void> => {
  try {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is required to connect to the database.");
    }

    await mongoose.connect(MONGODB_URI);
    console.log("[MongoDB] Connected successfully.");
  } catch (error: any) {
    console.error("[MongoDB] Connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
