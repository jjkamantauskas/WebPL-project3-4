import express from 'express';
import bcrypt from 'bcrypt';
import User from '../schema/user.js';

const router = express.Router();
console.log("authRoutes mounted");
// POST /admin/login
router.post('/login', async (req, res) => {
  try {
    const { login_name, password } = req.body;

    const user = await User.findOne({ login_name });
    if (!user) return res.status(400).send();

    const match = await bcrypt.compare(password, user.password_digest);
    if (!match) return res.status(400).send();
    console.log("LOGIN ATTEMPT:", login_name, password);
    console.log("USER FOUND:", user);
    console.log("PASSWORD MATCH:", match);
    req.session.user = user._id;

    req.session.save((err) => {
      if (err) {
        console.error(err);
        return res.status(500).send();
      }

      const safeUser = user.toObject();
      delete safeUser.password_digest;

      res.status(200).json(safeUser);
    });

  } catch (err) {
    console.error(err);
    res.status(400).send();
  }
});

router.post('/logout', (req, res) => {
  if (!req.session.user) {
    return res.status(400).json({ error: 'No user logged in' });
  }

  req.session.destroy(() => {
    res.status(200).json({ message: 'Logged out' });
  });
});

router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  User.findById(req.session.user)
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const safeUser = user.toObject();
      delete safeUser.password_digest;

      res.json(safeUser);
    })
    .catch(() => {
      res.status(500).json({ error: 'Server error' });
    });
});
export default router;