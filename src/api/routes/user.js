const express = require('express');
const controller = require('../controller/user.controller');
const router = express.Router();

const exists = require('../../middleware/doesRecordExist');
const validateRequestBody = require('../../middleware/validateRequestBody');
const JWTmiddleware = require('../../middleware/validateJWT');
const canEditMiddleware = require('../../middleware/canUserModify');

// UC-201: Register a new user
router.post('', [validateRequestBody.userBody, exists.isUserWithEmailDuplicate], controller.insertUser);

// UC-202: Retrieve a list of users
router.get('', [JWTmiddleware.validateToken], controller.listUsers);

// UC-203: Request your personal user profile
router.get('/profile', [JWTmiddleware.validateToken], controller.getUserProfile);

// UC-204: Retrieve a user by its id
router.get('/:id', [JWTmiddleware.validateToken, exists.doesUserWithIDExist], controller.getUserById);

// UC-205: Update a user
router.put('/:id', [JWTmiddleware.validateToken, exists.doesUserWithIDExist, canEditMiddleware.canUserModify, validateRequestBody.userBody], controller.updateUser);

// UC-206: Delete a user
router.delete('/:id', [JWTmiddleware.validateToken, exists.doesUserWithIDExist, canEditMiddleware.canUserModify], controller.deleteUser);


module.exports = router;