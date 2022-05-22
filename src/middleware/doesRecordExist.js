const db = require('../../config/db')

const doesUserWithIDExist = (req, res, next) => {
    db.query('SELECT COUNT(*) AS c FROM `user` WHERE `id` = ?', [req.params.id], (err, resp) => {
        if (err) {
            res.status(500).send({
                error: err.message
            })
        }

        const exists = Boolean(resp[0].c);
        if (exists) {
            next();
        } else {
            let status
            if (req.method == "GET") status = 404;

            res.status(status || 400).send({
                message: 'User does not exist'
            });
        }
    });
}

const doesUserWithEmailExist = (req, res, next) => {
    db.query('SELECT COUNT(*) AS c FROM `user` WHERE `emailAdress` = ?', [req.body.emailAdress], (err, resp) => {
        if (err) {
            res.status(500).send({
                message: err.message
            })
        }

        const exists = Boolean(resp[0].c)
        if (exists) {
            next();
        } else {
            res.status(404).send({
                message: 'User does not exist'
            });
        }
    });
}

const isUserWithEmailDuplicate = (req, res, next) => {
    db.query('SELECT COUNT(*) AS c FROM `user` WHERE `emailAdress` = ?', [req.body.emailAdress], (err, resp) => {
        if (err) {
            res.status(500).send({
                message: err.message
            })
        }

        const exists = Boolean(resp[0].c)
        if (!exists) {
            next();
        } else {
            res.status(409).send({
                message: `Requested user with email '${req.body.emailAdress}' already exists`
            });
        }
    });
}

const doesMealWithIdExist = (req, res, next) => {
    db.query('SELECT COUNT(*) AS c FROM `meal` WHERE `id` = ?', [req.params.id], (err, resp) => {
        if (err) {
            res.status(500).send({
                error: err.message
            })
        }

        const exists = Boolean(resp[0].c);
        if (exists) {
            next();
        } else {
            res.status(404).send({
                message: 'Meal does not exist'
            });
        }
    });
}


module.exports = {
    doesUserWithIDExist,
    doesUserWithEmailExist,
    isUserWithEmailDuplicate,
    doesMealWithIdExist
}