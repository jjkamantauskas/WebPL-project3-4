import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { useQuery } from '@tanstack/react-query';

// Used when you implement the TODO handlers below.
// eslint-disable-next-line no-unused-vars
import User from './schema/user.js';
// eslint-disable-next-line no-unused-vars
import Photo from './schema/photo.js';

const app = express();

// define these in env and import in this file
const port = process.env.PORT || 3000;
const mongoUrl = 'mongodb://127.0.0.1/project3';


// Enable CORS for frontend running on a different port
app.use(cors());

// Connect to MongoDB
mongoose.connect(mongoUrl);

mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
});

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * GET /user/list
 * Returns the list of users.
 */
const fetchUsers = async () => {
  const res = await fetch('user/list');
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
};

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchIsers,
  });
};

/**
 * GET /user/:id
 * Returns the details of one user.
 */
const fetchUser = async (id) => {
  const res = await fetch(`/user/${id}`);
  if (!res.ok) throw new Error('failed to fetch user');
  return res.json();
};

export const useUser = (id) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUser(id),
    enabled: !!id
  });
};

/**
 * GET /photosOfUser/:id
 * Returns all photos of the given user.
 */
const fetchPhotos = async (id) => {
  const res = await fetch(`/photosOfUser/${id}`);
  if (!res.ok) throw new Error('failed to fetch photos');
  return res.json();
};

export const usePhotos = (id) => {
  return useQuery({
    queryKey: ['photos', id],
    queryFn: () => fetchPhotos(id),
    enabled: !!id
  });
};

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
