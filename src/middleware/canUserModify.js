const db = require('../../config/db')

const canUserModifyUser = (req, res, next) => {
    const { userID } = req;
    const { id } = req.params;

    if (userID && id && userID == id) {
        next();
    } else {
        res.status(403).send({
            message: 'You can only modify your own user'
        })
    }
}

const canUserModifyMeal = (req, res, next) => {
    const { userID } = req;

    db.getConnection((err, conn) => {
        if (err) throw err;
        conn.query('SELECT `cookId` FROM `meal` WHERE `id` = ?', [req.params.id], (err, result) => {
            if (err) throw err;

            const meal = result[0]

            if (userID && meal.cookId && userID == meal.cookId) {
                next();
            } else {
                res.status(403).send({
                    message: 'You can only modify your own meals'
                })
            }

            conn.release();
        })
    })
}

module.exports = {
    canUserModifyUser,
    canUserModifyMeal
}