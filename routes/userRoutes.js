import express from 'express';
import mongoose from 'mongoose';
import { requireAuth } from '../middleware/auth.js';
import bcrypt from 'bcrypt';
import User from '../schema/user.js';

const router = express.Router();

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

router.get('/list', requireAuth, async (req, res) => {
  const users = await User.find({}, 'first_name last_name _id').lean();
  res.json(users);
});

router.get('/:id', requireAuth, async (req, res) => {
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

router.post('/', async (req, res) => {
  const {
    login_name,
    password,
    first_name,
    last_name,
    location,
    description,
    occupation
  } = req.body;

  try {
    // Validate required fields
    if (!login_name || !password || !first_name || !last_name) {
      return res.status(400).json({
        error: 'login_name, password, first_name, and last_name are required'
      });
    }

    // Check duplicate username
    const existingUser = await User.findOne({ login_name });

    if (existingUser) {
      return res.status(400).json({ error: 'login_name already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      login_name,
      password: hashedPassword,
      first_name,
      last_name,
      location,
      description,
      occupation
    });

    await newUser.save();

    // remove password before returning
    const { password: _, ...safeUser } = newUser.toObject();

    res.status(200).json(safeUser);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

export default router;