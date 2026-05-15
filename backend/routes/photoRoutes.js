import express from 'express';
import mongoose from 'mongoose';
/*
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
*/
import Photo from '../schema/photo.js';
import User from '../schema/user.js';
import { requireAuth } from '../middleware/auth.js';
/*
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
*/
const router = express.Router();
router.use((req, res, next) => {
  console.log("📸 PHOTO ROUTE HIT:", req.method, req.url);
  next();
});
/*/ ── Multer setup ────────────────────────────────────────────────────────────
const imagesDir = path.join(__dirname, '..', 'images');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, imagesDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ok =
      allowed.test(path.extname(file.originalname).toLowerCase()) &&
      allowed.test(file.mimetype);
    cb(ok ? null : new Error('Only image files are allowed'), ok);
  },
});
*/

// ── Helpers ─────────────────────────────────────────────────────────────────
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// ── GET /photosOfUser/:id ────────────────────────────────────────────────────
router.get('/photosOfUser/:id', requireAuth, async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid user id' });
  }

  try {
    const photos = await Photo.find({ user_id: id }).lean();
    const users = await User.find({}).lean();

    // Build a lookup map so we can resolve commenter names cheaply
    const userLookup = {};
    users.forEach((u) => {
      userLookup[u._id.toString()] = {
        _id: u._id,
        first_name: u.first_name,
        last_name: u.last_name,
      };
    });

    const result = photos.map((photo) => ({
      _id: photo._id,
      file_name: photo.file_name,
      date_time: photo.date_time,
      user_id: photo.user_id,
      // Include likes array so the frontend can compute count and current-user state
      likes: photo.likes || [],
      comments: (photo.comments || []).map((c) => ({
        _id: c._id,
        comment: c.comment,
        date_time: c.date_time,
        user: userLookup[c.user_id?.toString()],
      })),
    }));

    res.json(result);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ── POST /photos ─────────────────────────────────────────────────────────────
// Accepts a JSON body with a `url` field (Cloudinary URL).
// Creates a new photo document associated with the logged-in user.
router.post('/photos', requireAuth, async (req, res) => {
  const { url } = req.body;

  if (!url || !url.trim()) {
    return res.status(400).json({ error: 'Photo URL is required' });
  }

  try {
    const photo = new Photo({
      file_name: url.trim(),
      date_time: new Date(),
      user_id: new mongoose.Types.ObjectId(req.session.user),
      comments: [],
      likes: [],
    });

    await photo.save();
    res.status(201).json(photo);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// ── POST /photos/:photoId/like ───────────────────────────────────────────────
// Toggles the like status for the currently logged-in user on the given photo.
// - If the user has NOT liked the photo → adds their _id to the likes array ($addToSet).
// - If the user HAS already liked the photo → removes their _id ($pull).
// Returns the updated photo object, or 404 if the photo doesn't exist.
router.post('/photos/:photoId/like', requireAuth, async (req, res) => {
  const { photoId } = req.params;
  const userId = req.session.user;

  if (!isValidObjectId(photoId)) {
    return res.status(400).json({ error: 'Invalid photo id' });
  }

  try {
    const photo = await Photo.findById(photoId);

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    // Check whether the user has already liked this photo
    const alreadyLiked = photo.likes.some(
      (id) => id.toString() === userId.toString()
    );

    if (alreadyLiked) {
      // Unlike: remove the user's _id from the likes array
      await Photo.findByIdAndUpdate(photoId, { $pull: { likes: userObjectId } });
    } else {
      // Like: add the user's _id (no duplicates thanks to $addToSet)
      await Photo.findByIdAndUpdate(photoId, { $addToSet: { likes: userObjectId } });
    }

    // Return the freshly updated photo
    const updatedPhoto = await Photo.findById(photoId).lean();
    res.json(updatedPhoto);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// ── POST /commentsOfPhoto/:photoId ───────────────────────────────────────────
// Adds a comment to the specified photo. The commenter's user_id is taken from
// the session so it cannot be spoofed by the client.
router.post('/commentsOfPhoto/:photoId', requireAuth, async (req, res) => {
  const { photoId } = req.params;
  const { comment } = req.body;
  // Validate comment text
  if (!comment || !comment.trim()) {
    return res.status(400).json({ error: 'Comment text is required' });
  }

  if (!isValidObjectId(photoId)) {
    return res.status(400).json({ error: 'Invalid photo id' });
  }

  try {
    const photo = await Photo.findById(photoId);

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    // Push the new comment into the embedded comments array
    photo.comments.push({
      comment: comment.trim(),
      date_time: new Date(),
      user_id: new mongoose.Types.ObjectId(req.session.user),
    });

    await photo.save();
    res.status(200).json(photo);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

export default router;
