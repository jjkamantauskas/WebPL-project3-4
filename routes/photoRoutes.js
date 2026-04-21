import express from 'express';
import mongoose from 'mongoose';
import Photo from '../schema/photo.js';
import User from '../schema/user.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * GET /photosOfUser/:id
 * Returns all photos of the given user.
 */
router.get('/photosOfUser/:id', async (req, res) => {
  const id = req.params.id;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid user id' });
  }

  try {
    const photos = await Photo.find({ user_id: id }).lean();
    const users = await User.find({}).lean();

    // Build user lookup map
    const userLookup = {};
    users.forEach(u => {
      userLookup[u._id.toString()] = {
        _id: u._id,
        first_name: u.first_name,
        last_name: u.last_name
      };
    });

    // Format response
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

export default router;