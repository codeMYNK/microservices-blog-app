import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";

import userRoutes from "./routes/user.route.js";
import { v2 as cloudinary } from "cloudinary";
dotenv.config();

if (
  !process.env.Cloud_Name ||
  !process.env.Cloud_Api_Key ||
  !process.env.Cloud_Api_Secret
) {
  throw new Error("Cloudinary environment variables are not set");
}

cloudinary.config({
  cloud_name: process.env.Cloud_Name as string,
  api_key: process.env.Cloud_Api_Key as string,
  api_secret: process.env.Cloud_Api_Secret as string,
});

const app = express();

connectDB();

app.use(express.json());

app.use("/api/v1", userRoutes);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`User service is running on port ${PORT}`);
});
