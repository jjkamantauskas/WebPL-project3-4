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
app.get('/user/list', async (req, res) => {
  const users = await User.find({}, 'first_name last_name _id').lean();
  res.json(users);
});


/**
 * GET /user/:id
 * Returns the details of one user.
 */
app.get('/user/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user);
});


/**
 * GET /photosOfUser/:id
 * Returns all photos of the given user.
 */
app.get('/photosOfUser/:id', async (req, res) => {
  try {
    const photos = await Photo.find({ user_id: req.params.id }).lean();
    const users = await User.find({}).lean();

    const userLookup = {};
    users.forEach(user => {
      userLookup[user._id.toString()] = {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name
      };
    });

    const result = photos.map(photo => ({
      ...photo,
      comments: (photo.comments || []).map(comment => ({
        _id: comment._id,
        comment: comment.comment,
        date_time: comment.date_time,
        user: userLookup[comment.user_id?.toString()] || null
      }))
    }));

    res.json(result);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

