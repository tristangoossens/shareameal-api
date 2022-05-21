const db = require('../../database/auth');
const jwt = require('jsonwebtoken')

const login = (req, res) => {
    const { emailAdress, password } = req.body;

    db.getUserInfo(emailAdress).then((user) => {
        if (user && user.password == password) {
            const { password, ...userInfo } = user;
            const payload = { userID: userInfo.id }

            jwt.sign(payload, process.env.JWT_KEY, { expiresIn: '12d' }, ((_, token) => {
                res.status(200).send({
                    result: {
                        ...userInfo,
                        token
                    }
                })
            }))
        } else {
            res.status(401).json({
                message: `Invalid password entered for user '${emailAdress}'`,
            })
        }
    }).catch((err) => {
        res.status(500).json({
            message: err,
        })
    })
}

module.exports = { login }