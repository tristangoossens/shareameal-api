const jwt = require('jsonwebtoken');

const validateToken = (req, res, next) => {
    // Check if the auth header is set
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).send({
            message: 'Authorization header missing!',
        })
    }

    // Strip the word 'Bearer ' from the headervalue
    const token = authHeader.substring(7, authHeader.length);

    // Verify token
    jwt.verify(token, process.env.JWT_KEY, (err, payload) => {
        if (err) {
            res.status(401).send({
                message: 'Not authorized'
            })
        }

        if (payload) {
            req.userID = payload.userID;
            next();
        }
    })
}

module.exports = { validateToken }