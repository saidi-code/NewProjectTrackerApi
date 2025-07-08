import mongoose from "mongoose";
import config from "../config";
export async function initMongoDB() {
  const uri = config.MONGO_URI;

  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB 🆗");
  } catch (err) {
    console.log("Failed to connect to MongoDB ❌", err);
  }
}
