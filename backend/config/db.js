import mongoose from "mongoose";

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1); // Exit with failure
  }
}

export default connectDB;
