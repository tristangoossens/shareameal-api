const express = require('express');
const router = express.Router();

const mealRoutes = require('./routes/meal');
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');

// Meal endpoints
router.use('/api/meals', mealRoutes);

// User endpoints
router.use('/api/users', userRoutes);

// Auth endpoints
router.use('/api/auth', authRoutes);

module.exports = router;