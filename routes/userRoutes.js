import express from 'express';
import mongoose from 'mongoose';
import { requireAuth } from '../middleware/auth.js';
import bcrypt from 'bcrypt';
import User from '../schema/user.js';

const router = express.Router();

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

router.get('/list', async (req, res) => {
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
  try {
    const {
      login_name,
      password,
      first_name,
      last_name,
      location,
      description,
      occupation
    } = req.body;

    if (!login_name || !password || !first_name || !last_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existing = await User.findOne({ login_name });
    if (existing) {
      return res.status(400).json({ error: 'Login name already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      login_name,
      password_digest: hashedPassword,
      first_name,
      last_name,
      location,
      description,
      occupation
    });

    await user.save();

    res.status(201).json({
      _id: user._id,
      login_name: user.login_name,
      first_name: user.first_name,
      last_name: user.last_name
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});



export default router;