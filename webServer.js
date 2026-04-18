import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

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
    // TODO:
    // 1. Fetch all users from MongoDB.
    // 2. Return only the fields required by the frontend.
    //for user list, this is only the names and the ids (for url purposes)
    const users = await User.find({}, 'first_name last_name _id').lean();
    return res.json(users);//shoudl return fname, lname and _id
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

/**
 * GET /user/:id
 * Returns the details of one user.
 */
app.get('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    // TODO:
    // 1. Find the user by id.
    // 2. If the user does not exist, return 404.
    // 3. Return only the fields required by the frontend.
    // return all parts of the user object

    const user = await User.findById(id, 'first_name last_name location description occupation _id');
    if(!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(user);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

/**
 * GET /photosOfUser/:id
 * Returns all photos of the given user.
 */
app.get('/photosOfUser/:id', async (req, res) => {
  try {
    const id = req.params.id;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    // TODO:
    // 1. Find all photos whose user_id matches userId.
    // 2. Fetch all users from MongoDB.
    // 3. Build a lookup structure from user _id to user object.
    // 4. For each photo, construct the response expected by the frontend.
    // 5. For each comment, include the corresponding user object in comment.user.
    // 6. Return the resulting array.
    const photos = await Photo.find({ user_id: id }).lean();
    const users = await User.find({}).lean();
    /*
    const userLookup = {};
    users.forEach(user => {
      userLookup[user.id.toString()] = user.toObject();
    });

    const formattedPhotos = photos.map(photo => {
      const photoObj = photo.toObject();

      photoObj.comments = (photoObj.comments || []).map(comment => ({
        _id: comment._id,
        comment: comment.comment,
        date_time: comment.date_time,
        user: comment.user_id
          ? userLookup[comment.user_id.toString()]
          : null
      }));

      return photoObj;
    });
  */
  // build strict lookup (ONLY allowed fields)
    const userLookup = {};
    users.forEach(user => {
      userLookup[user._id.toString()] = {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name
      };
    });

    const formattedPhotos = photos.map(photo => ({
      _id: photo._id,
      file_name: photo.file_name,
      date_time: photo.date_time,
      user_id: photo.user_id,
      comments: (photo.comments || []).map(comment => ({
        _id: comment._id,
        comment: comment.comment,
        date_time: comment.date_time,
        user: userLookup[comment.user_id?.toString()]
      }))
    }));

    return res.json(formattedPhotos);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
