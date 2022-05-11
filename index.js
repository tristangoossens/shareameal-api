// Import environment variables for local development
require('dotenv').config();

const express = require('express');
const router = require('./src/api');

// Create instance of express server
const app = express()

// Configure app to use JSON
app.use(express.json());

// Assign main router to app
app.use(router);

// Setup server to listen on specified port
app.listen(process.env.PORT, () => {
    console.log(`shareameal-api listening on port ${process.env.PORT}`)
})

module.exports = app;