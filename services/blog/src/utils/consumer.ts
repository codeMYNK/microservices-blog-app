// import amqp from 'amqplib';
// import dotenv from 'dotenv';
// import { redisClient } from '../server.js';
// import { sql } from './db.js';

// dotenv.config();

// // let channel: amqp.Channel;

// interface CacheInvalidationMessage {
//     action: string,
//     keys: string[],
// }

// export const startCacheConsumer = async() => {
//     try {
//         const connection = await amqp.connect({
//             protocol: "amqp",
//             hostname: process.env.RABBITMQ_HOST || "localhost",
//             port : parseInt(process.env.RABBITMQ_PORT as string) || 5672,
//             username: process.env.RABBITMQ_DEFAULT_USER || "admin",
//             password: process.env.RABBITMQ_DEFAULT_PASS || "admin123",
//         });

//         const channel = await connection.createChannel();

//         const queueName = "cache_invalidation";

//         await channel.assertQueue(queueName, { durable: true });

//         console.log("✅ Blog Service Cache Consumer Started");

//         channel.consume(queueName, async (msg) => {
//             if (msg) {
//                 try {
//                     const content = JSON.parse(msg.content.toString()) as CacheInvalidationMessage;
//                     console.log("📥 Blog service recieved cache invalidation message", content);

//                     // Remove cached data from redis
//                     if(content.action === "invalidateCache" && content.keys.length > 0) {
//                         for(const pattern of content.keys){
//                             const keys = await redisClient.keys(pattern);

//                             if(keys.length > 0) {
//                                 await redisClient.del(keys);
//                                 console.log(`🗑️  Blog service invalidated for keys: ${keys.join(", ")} cache keys matching: ${pattern}`);

//                                 // const {searchQuery = "", category = ""} = req.query;

//                                 const category = "";
//                                 const searchQuery = "";

//                                 const cacheKey = `blogs:${searchQuery}:${category}`;

//                                 const blogs = await sql`SELECT * FROM blogs ORDER BY create_at DESC`;

//                                 await redisClient.set(cacheKey, JSON.stringify(blogs), { EX: 3600 });

//                                 console.log(`🔄 Cache rebuilt with key: ${cacheKey}`);

//                             }
//                         }
//                     }
//                     channel.ack(msg);
//                 } catch (error) {
//                     console.error("❌ Error processing cache invalidation in blog service:", error);
//                     channel.nack(msg, false, true); // Discard the message
//                 }
//             }
//         })
//     } catch (error) {
//         console.error("❌ Failed to start blog service RabbitMQ consumer:", error);
//     }
// }



import amqp from 'amqplib';
import dotenv from 'dotenv';
import { redisClient } from '../server.js';
import { sql } from './db.js';

dotenv.config();

interface CacheInvalidationMessage {
    action: string,
    keys: string[],
}

export const startCacheConsumer = async() => {
    try {
        // ✅ Updated connection logic using RABBITMQ_URL
        const rabbitmqUrl = process.env.RABBITMQ_URL || "amqp://localhost:5672";
        const connection = await amqp.connect(rabbitmqUrl);

        const channel = await connection.createChannel();

        const queueName = "cache_invalidation";

        await channel.assertQueue(queueName, { durable: true });

        console.log("✅ Blog Service Cache Consumer Started");

        channel.consume(queueName, async (msg) => {
            if (msg) {
                try {
                    const content = JSON.parse(msg.content.toString()) as CacheInvalidationMessage;
                    console.log("📥 Blog service recieved cache invalidation message", content);

                    // Remove cached data from redis
                    if(content.action === "invalidateCache" && content.keys.length > 0) {
                        for(const pattern of content.keys){
                            const keys = await redisClient.keys(pattern);

                            if(keys.length > 0) {
                                await redisClient.del(keys);
                                console.log(`🗑️  Blog service invalidated for keys: ${keys.join(", ")} cache keys matching: ${pattern}`);

                                const category = "";
                                const searchQuery = "";

                                const cacheKey = `blogs:${searchQuery}:${category}`;

                                const blogs = await sql`SELECT * FROM blogs ORDER BY create_at DESC`;

                                await redisClient.set(cacheKey, JSON.stringify(blogs), { EX: 3600 });

                                console.log(`🔄 Cache rebuilt with key: ${cacheKey}`);

                            }
                        }
                    }
                    channel.ack(msg);
                } catch (error) {
                    console.error("❌ Error processing cache invalidation in blog service:", error);
                    channel.nack(msg, false, true); // Discard the message
                }
            }
        })
    } catch (error) {
        console.error("❌ Failed to start blog service RabbitMQ consumer:", error);
    }
}