const express = require('express');
const router = express.Router();

const mealRoutes = require('./routes/meal');
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');

// Meal endpoints
router.use('/api/meal', mealRoutes);

// User endpoints
router.use('/api/user', userRoutes);

// Auth endpoints
router.use('/api/auth', authRoutes);

// Handle whenever a requested route does not exist
router.all('*', (req, res) => {
    res.status(404).send({
        status: 404,
        error: `Requested route was not found`
    })
})

module.exports = router;