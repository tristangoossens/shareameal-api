const express = require('express');
const router = express.Router();

// Middlewares
const exist = require('../../middleware/doesRecordExist');
const validateRequestBody = require('../../middleware/validateRequestBody');

// Controller
const controller = require('../controller/auth.controller');

// UC-101: Login with credentials
router.post('/login', [validateRequestBody.loginBody, exist.doesUserWithEmailExist], controller.login);

module.exports = router;