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
  try {
    const users = await User.find({}, 'first_name last_name _id').lean();
    res.json(users);
  } catch (err) {
    res.status(500).send(err.message);
  }
});


/**
 * GET /user/:id
 * Returns the details of one user.
 */
app.get('/user/:id', async (req, res) => {
  const id = req.params.id;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid user id' });
  }

  const user = await User.findById(
    id,
    'first_name last_name location description occupation _id'
  ).lean();

  if (!user) return res.status(404).send();

  res.json(user);
});


/**
 * GET /photosOfUser/:id
 * Returns all photos of the given user.
 */
app.get('/photosOfUser/:id', async (req, res) => {
  const id = req.params.id;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid user id' });
  }

  try {
    const photos = await Photo.find({ user_id: id }).lean();
    const users = await User.find({}).lean();

    const userLookup = {};
    users.forEach(u => {
      userLookup[u._id.toString()] = {
        _id: u._id,
        first_name: u.first_name,
        last_name: u.last_name
      };
    });

    const result = photos.map(photo => ({
      _id: photo._id,
      file_name: photo.file_name,
      date_time: photo.date_time,
      user_id: photo.user_id,
      comments: (photo.comments || []).map(c => ({
        _id: c._id,
        comment: c.comment,
        date_time: c.date_time,
        user: userLookup[c.user_id?.toString()]
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

