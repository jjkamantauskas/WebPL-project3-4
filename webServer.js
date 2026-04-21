import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

// Used when you implement the TODO handlers below.
// eslint-disable-next-line no-unused-vars
import User from './schema/user.js';
// eslint-disable-next-line no-unused-vars
import Photo from './schema/photo.js';

import userRoutes from './routes/userRoutes.js';
import photoRoutes from './routes/photoRoutes.js';
import authRoutes from './routes/authRoutes.js';

import session from 'express-session';

const app = express();

// define these in env and import in this file
const port = process.env.PORT || 3001;
const mongoUrl = 'mongodb://127.0.0.1/project3';


// Middleware
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));

app.use(express.json()); //needed for req.body

app.use(session({
  secret: 'super_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
  }
}));

// Connect to MongoDB
mongoose.connect(mongoUrl);

mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
});

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// Auth middleware (IMPORTANT)
function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

app.post('/admin/login', (req, res, next) => {
  console.log("LOGIN HIT RAW");
  next();
});

app.use((req, res, next) => {
  console.log("GLOBAL HIT:", req.method, req.url);
  next();
});

app.use((req, res, next) => {
  console.log("SESSION EXISTS?", !!req.session);
  next();
});
app.use('/admin', authRoutes);
app.use('/user', userRoutes);
app.use('/', photoRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

