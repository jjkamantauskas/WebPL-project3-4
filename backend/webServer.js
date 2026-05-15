import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import session from 'express-session';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import User from './schema/user.js';
import Photo from './schema/photo.js';

import userRoutes from './routes/userRoutes.js';
import photoRoutes from './routes/photoRoutes.js';
import authRoutes from './routes/authRoutes.js';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const port = process.env.PORT || 3001;
const mongoUrl = process.env.MONGODB_URI;

app.set("trust proxy", 1);

app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://web-pl-project3-4.vercel.app"
  ],
  credentials: true,
}));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  },
}));

mongoose.connect(mongoUrl);
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
mongoose.connection.once('open', () => console.log('Connected to MongoDB'));

app.use('/admin', authRoutes);
app.use('/user', userRoutes);
app.use('/', photoRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});