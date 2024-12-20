const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const testDb = require('../database/testDb');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await new Promise((resolve, reject) => {
      testDb.db.get(
        'SELECT * FROM users WHERE email = ?',
        [email],
        (err, row) => {
          if (err) reject(err);
          resolve(row || null);
        }
      );
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (isValid) {
      req.session.userId = user.id;
      res.status(200).json({ message: 'Login successful' });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 