const db = require('../../database/user');

const insertUser = (req, res) => {
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
}

const listUsers = (req, res) => {
    db.retrieveUsers().then((users) => {
        res.status(200).send({
            result: users
        });
    }).catch((err) => {
        res.status(500).send({
            message: err
        });
    })
}

const getUserById = (req, res) => {
    db.retrieveUserByID(req.params.id).then((user) => {
        res.status(200).send({
            result: user
        });
    }).catch((err) => {
        res.status(500).send({
            message: err
        });
    })
}

const getUserProfile = (req, res) => {
    res.status(501).send({
        message: 'This endpoint is yet to be implemented into this API'
    })
}

const updateUser = (req, res) => {
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
}

const deleteUser = (req, res) => {
    db.deleteUser(req.params.id).then((user) => {
        res.status(200).send({
            message: `User with id '${req.params.id}' has been deleted`
        });
    }).catch((err) => {
        res.status(500).send({
            message: err
        });
    })
}

module.exports = {
    insertUser,
    listUsers,
    getUserById,
    getUserProfile,
    updateUser,
    deleteUser
}