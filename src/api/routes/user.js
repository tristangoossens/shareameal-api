const express = require('express');
const router = express.Router();

// UC-201: Register a new user
router.post('', (req, res) => {
    res.send({
        message: "Inserting user"
    });
});

// UC-202: Retrieve a list of users
router.get('', (req, res) => {
    res.send({
        message: "Getting user list"
    });
});

// UC-204: Retrieve a user by its id
router.get('/:id', (req, res) => {
    res.send({
        message: `Getting user with id ${req.params.id}`
    });
});

// UC-205: Update a user
router.put('/:id', (req, res) => {
    res.send({
        message: `Updating user with id ${req.params.id}`
    });
});

// UC-206: Delete a user
router.delete('/:id', (req, res) => {
    res.send({
        message: `Deleting user with id ${req.params.id}`
    });
});

module.exports = router;