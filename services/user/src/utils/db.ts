import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
    try {
        mongoose.connect(process.env.MONGO_URI as string, {
            dbName: "blog",
        });
        console.log("Connected to MongoDB 🤩");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
}

export default connectDB;