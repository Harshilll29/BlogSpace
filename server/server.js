import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';
import cors from 'cors';
import { createRequire } from 'module';

import admin from 'firebase-admin';

import './config/database.js';

import authRoutes from './routes/authRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import statsRoutes from './routes/statsRoutes.js';

const app = express();
const port = process.env.PORT || 3000;


const require = createRequire(import.meta.url);
const serviceAccountKey = require('./blog-app-7363a-firebase-adminsdk-fbsvc-c75eac95a0.json');


app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://blogsspace.netlify.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200
}));


admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey)
});

app.options('*', cors());

// body parser
app.use(express.json());

app.use('/', authRoutes);
app.use('/', blogRoutes);
app.use('/', commentRoutes);
app.use('/', notificationRoutes);
app.use('/', profileRoutes);
app.use('/', uploadRoutes);
app.use('/api/stats', statsRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});