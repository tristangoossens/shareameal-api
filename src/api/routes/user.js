const express = require('express');
const controller = require('../controller/user.controller');
const router = express.Router();

const exists = require('../../middleware/doesRecordExist');
const validateRequestBody = require('../../middleware/validateRequestBody');

// UC-201: Register a new user
router.post('', [validateRequestBody.userBody, exists.doesUserWithEmailExist], controller.insertUser);

// UC-202: Retrieve a list of users
router.get('', controller.listUsers);

// UC-203: Request your personal user profile
router.get('/profile', controller.getUserProfile);

// UC-204: Retrieve a user by its id
router.get('/:id', [exists.doesUserWithIDExist], controller.getUserById);

// UC-205: Update a user
router.put('/:id', [exists.doesUserWithIDExist, validateRequestBody.userBody], controller.updateUser);

// UC-206: Delete a user
router.delete('/:id', [exists.doesUserWithIDExist], controller.deleteUser);


module.exports = router;