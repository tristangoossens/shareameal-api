const doesUserWithIDExist = (req, res, next) => {
    db.query('SELECT COUNT(*) AS c FROM `user` WHERE `id` = ?', [req.params.id]).then((resp) => {
        const exists = Boolean(JSON.parse(JSON.stringify(resp[0][0])).c);
        if (exists) {
            next();
        } else {
            res.status(404).send({
                status: 404,
                error: `Requested user with id '${req.params.id}' was not found`
            });
        }
    }).catch((err) => {
        res.status(500).send({
            status: 500,
            error: err.message
        })
    });
}

const doesUserWithEmailExist = (req, res, next) => {
    db.query('SELECT COUNT(*) AS c FROM `user` WHERE `emailAdress` = ?', [req.body.emailAdress]).then((resp) => {
        const exists = Boolean(JSON.parse(JSON.stringify(resp[0][0])).c);
        if (!exists) {
            next();
        } else {
            res.status(400).send({
                status: 400,
                error: `Requested user with email '${req.body.emailAdress}' already exists`
            });
        }
    }).catch((err) => {
        res.status(500).send({
            status: 500,
            error: err.message
        })
    });
}


module.exports = {
    doesUserWithIDExist,
    doesUserWithEmailExist,
}