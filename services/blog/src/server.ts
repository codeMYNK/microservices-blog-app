import express from 'express';
import dotenv from "dotenv";
import blogRoutes from './routes/blog.routes.js';
import { createClient } from 'redis';
import { startCacheConsumer } from './utils/consumer.js';
import cors from 'cors';


dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'https://microservices-blog-app-frontend-z1c.vercel.app'
  ],
  credentials: true,      // if you're sending cookies or auth headers
}));

// app.options('*', cors()); // Pre-flight requests ke liye

const PORT = Number(process.env.PORT) || 8005;

startCacheConsumer();

export const redisClient = createClient({
  url: process.env.REDIS_URL as string,
  socket: {
    keepAlive: true,
    reconnectStrategy: (retries) => {
      console.log(`Redis reconnect attempt: ${retries}`);

      if (retries > 10) {
        console.error("❌ Redis retry limit reached");
        return new Error("Retry attempts exhausted");
      }

      return Math.min(retries * 200, 3000);
    },
  },
});


redisClient.on("error", (err) => {
  console.error("❌ Redis Error:", err.message);
});

redisClient.on("connect", () => {
  console.log("🔌 Connecting to Redis...");
});

redisClient.on("ready", () => {
  console.log("✅ Redis ready");
});

redisClient.on("end", () => {
  console.warn("⚠️ Redis connection closed");
});

redisClient.on("reconnecting", () => {
  console.log("🔄 Reconnecting to Redis...");
});


const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("Connected to Redis");
  } catch (err) {
    console.error("❌ Redis initial connection failed:", err);
  }
};

connectRedis();

app.get('/', (req, res) => {
    res.send("Blog Service is Live and Reachable! 🚀");
});

app.use('/api/v1', blogRoutes);

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Blog service running on port ${PORT}`);
});