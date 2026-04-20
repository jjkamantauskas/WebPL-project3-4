import express from 'express';
import User from '../schema/user.js';
import bcrypt from 'bcrypt';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { login_name, password } = req.body;

  try{
    const user = await User.findOne({ login_name });

    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.comapre(password, user.password_digest);

    if(!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials '})
    }

    req.session.user = {
        _id: user._id,
        login_name: user.login_name
    };
    // exclude password before returning
    const { password: _, ...safeUser } = user.toObject();

    res.json(safeUser);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.post('/logout', (req, res) => {
  if (!req.session.user) {
    return res.status(400).json({ error: 'No user logged in' });
  }

  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Logout failed');
    }

    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});

export default router;