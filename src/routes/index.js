const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const teamRoutes = require('./teamRoutes');

router.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// Route-Gruppen
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/teams', teamRoutes);

module.exports = router; 