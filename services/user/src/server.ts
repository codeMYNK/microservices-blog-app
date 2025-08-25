import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './utils/db.js';

import userRoutes from './routes/user.route.js';

const app = express();
dotenv.config();
connectDB();

app.use(express.json());

app.use('/api/v1', userRoutes);




const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`User service is running on port ${PORT}`);
})