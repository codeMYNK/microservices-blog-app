import express from 'express';
import dotenv from "dotenv";
import blogRoutes from './routes/blog.routes.js';
import { createClient } from 'redis';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 8005;

export const redisClient = createClient({
    url: process.env.REDIS_URL as string
});

redisClient.connect().then(() => {
    console.log("Connected to Redis");
}).catch(console.error);

app.use(express.json());
app.use('/api/v1', blogRoutes);

app.listen(PORT, ()=> {
    console.log(`Blog service running on port ${PORT}`);
})