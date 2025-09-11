import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

let channel: amqp.Channel;
// let connection: amqp.Connection;

export const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect({
            protocol: "amqp",
            hostname: process.env.RABBITMQ_HOST || "localhost",
            port : parseInt(process.env.RABBITMQ_PORT as string) || 5672,
            username: process.env.RABBITMQ_DEFAULT_USER || "admin",
            password: process.env.RABBITMQ_DEFAULT_PASS || "admin123",
        });

        channel = await connection.createChannel();
        console.log("✅ RabbitMQ connected successfully");
    } catch (error) {
        console.error("❌ RabbitMQ connection failed:", error);
    }
};

export const publishToQueue = async (queueName: string, message: any) => {
    if(!channel) {
        console.error("RabbitMQ Channel is not initialized");
        return;
    }
    await channel.assertQueue(queueName, { durable: true });

    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)),{
        persistent: true
    });
};

export const invalidateCacheJob = async(cacheKeys: string[]) => {
    try {
        const message = {
            action: "invalidateCache",
            keys: cacheKeys,
        };
        await publishToQueue("cache_invalidation", message);
        console.log("✅ Cache invalidation job published to RabbitMQ");
    } catch (error) {
        console.error("❌ Failed to publish cache on RabbitMQ", error);
    }
};