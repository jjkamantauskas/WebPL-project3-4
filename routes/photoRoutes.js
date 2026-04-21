import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Photo from '../schema/photo.js';
import User from '../schema/user.js';
import { requireAuth } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// ── Multer setup ────────────────────────────────────────────────────────────
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

// ── POST /photos/new ─────────────────────────────────────────────────────────
// Requires: multipart/form-data with a single "photo" file field.
// Ownership is taken from the session — no userId needed in the form body.
router.post('/photos/new', requireAuth, upload.single('photo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  try {
    const photo = new Photo({
      file_name: req.file.filename,
      date_time: new Date(),
      user_id: new mongoose.Types.ObjectId(req.session.user),
      comments: [],
    });

    await photo.save();
    res.status(201).json(photo);
  } catch (err) {
    // Clean up the uploaded file so we don't leave orphans
    fs.unlinkSync(req.file.path);
    res.status(500).send(err.message);
  }
});

export default router;
