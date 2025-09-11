import express from 'express';
import dotenv from "dotenv";
import blogRoutes from './routes/blog.routes.js';
import { createClient } from 'redis';
import { startCacheConsumer } from './utils/consumer.js';
import cors from 'cors';


dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 8005;

startCacheConsumer();

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