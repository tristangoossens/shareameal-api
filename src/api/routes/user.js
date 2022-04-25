const express = require('express');
const db = require('../../database/user')
const router = express.Router();

// UC-201: Register a new user
router.post('', (req, res) => {
    db.insertUser(req.body).then((users) => {
        res.status(201).send({
            status: 201,
            result: users
        });
    }).catch((err) => {
        res.status(400).send({
            status: 400,
            error: err
        });
    })
});

// UC-202: Retrieve a list of users
router.get('', (req, res) => {
    db.retrieveUsers().then((users) => {
        res.status(200).send({
            status: 200,
            result: users
        });
    }).catch((err) => {
        res.status(500).send({
            status: 500,
            error: err
        });
    })
});

// UC-203: Request your personal user profile
router.get('/profile', (req, res) => {
    res.status(501).send({
        status: 501,
        error: 'This endpoint is yet to be implemented into this API'
    })
});

// UC-204: Retrieve a user by its id
router.get('/:id', (req, res) => {
    db.retrieveUserByID(req.params.id).then((user) => {
        res.status(200).send({
            status: 200,
            result: user
        });
    }).catch((err) => {
        res.status(404).send({
            status: 404,
            error: err
        });
    })
});

// UC-205: Update a user
router.put('/:id', (req, res) => {
    db.updateUser(req.params.id, req.body).then((user) => {
        res.status(200).send({
            status: 200,
            result: user
        });
    }).catch((err) => {
        res.status(404).send({
            status: 404,
            error: err
        });
    })
});

// UC-206: Delete a user
router.delete('/:id', (req, res) => {
    db.deleteUser(req.params.id).then((user) => {
        res.status(200).send({
            status: 200,
            result: user
        });
    }).catch((err) => {
        res.status(404).send({
            status: 404,
            error: err
        });
    })
});

module.exports = router;