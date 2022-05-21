const express = require('express');
const db = require('../../database/user')
const router = express.Router();

const exists = require('../../middleware/doesRecordExist');
const validateRequestBody = require('../../middleware/validateRequestBody');

// UC-201: Register a new user
router.post('', [validateRequestBody.userBody, exists.doesUserWithEmailExist], (req, res) => {
    db.insertUser(req.body).then((user) => {
        res.status(201).send({
            result: {
                id: user.insertId,
                ...req.body
            }
        });
    }).catch((err) => {
        res.status(500).send({
            message: err
        });
    })
});

// UC-202: Retrieve a list of users
router.get('', (req, res) => {
    db.retrieveUsers().then((users) => {
        res.status(200).send({
            result: users
        });
    }).catch((err) => {
        res.status(500).send({
            message: err
        });
    })
});

// UC-203: Request your personal user profile
router.get('/profile', (req, res) => {
    res.status(501).send({
        message: 'This endpoint is yet to be implemented into this API'
    })
});

// UC-204: Retrieve a user by its id
router.get('/:id', [exists.doesUserWithIDExist], (req, res) => {
    db.retrieveUserByID(req.params.id).then((user) => {
        res.status(200).send({
            result: user
        });
    }).catch((err) => {
        res.status(500).send({
            message: err
        });
    })
});

// UC-205: Update a user
router.put('/:id', [exists.doesUserWithIDExist, validateRequestBody.userBody], (req, res) => {
    db.updateUser(req.params.id, req.body).then((_) => {
        res.status(200).send({
            result: {
                id: req.params.id,
                ...req.body
            }
        });
    }).catch((err) => {
        res.status(500).send({
            message: err
        });
    })
});

// UC-206: Delete a user
router.delete('/:id', [exists.doesUserWithIDExist], (req, res) => {
    db.deleteUser(req.params.id).then((user) => {
        res.status(200).send({
            message: `User with id '${req.params.id}' has been deleted`
        });
    }).catch((err) => {
        res.status(500).send({
            message: err
        });
    })
});

module.exports = router;