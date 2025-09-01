import express from 'express';
import dotenv from "dotenv";
import { sql } from './utils/db.js';
import blogRouter from './routes/blog.routes.js';
import {v2 as cloudinary} from "cloudinary";

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

const PORT = process.env.PORT || 8001;

async function initDB(){
    try {
        await sql`
        CREATE TABLE IF NOT EXISTS blogs (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description VARCHAR(255) NOT NULL,
        blogcontent TEXT NOT NULL,
        image VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;

        await sql`
        CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        comment VARCHAR(255) NOT NULL,
        userid VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL,
        blogid VARCHAR(255) NOT NULL,
        create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;

        await sql`
        CREATE TABLE IF NOT EXISTS savedblogs (
        id SERIAL PRIMARY KEY,
        userid VARCHAR(255) NOT NULL,
        blogid VARCHAR(255) NOT NULL,
        create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;

        console.log("Database initialized Successfully")
    } catch (error) {
        console.log("Error in initializing database", error);
    }
}

app.use("/api/v1", blogRouter);

initDB().then(()=> {
    app.listen(PORT, () => {
    console.log(`Author service is running on port ${PORT}`);
    });
})

