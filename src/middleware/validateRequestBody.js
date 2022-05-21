const assert = require('assert');

const userBody = (req, res, next) => {
    try {
        const { firstName, lastName, street, city, password, emailAdress } = req.body;


        assert(typeof firstName === 'string', 'Firstname must be in string format');
        assert(typeof lastName === 'string', 'Lastname must be in string format');
        assert(typeof street === 'string', 'Street must be in string format');
        assert(typeof city === 'string', 'City must be in string format');
        assert(typeof password === 'string', 'Password must be in string format');
        assert(typeof emailAdress === 'string', 'Email must be in string format');

        // Extra validation email regex
        const emailRegex = new RegExp(/^[^\s@]+@[^\s@]+.[^\s@]+$/);
        assert.match(emailAdress, emailRegex, 'Email must be in valid email format')

        next();
    } catch (err) {
        res.status(400).send({
            message: err.message
        })
    }
}

const loginBody = (req, res, next) => {
    try {
        const { emailAdress, password } = req.body;

        assert(typeof emailAdress === 'string', 'Email must be in string format');
        assert(typeof password === 'string', 'Password must be in string format');

        next();
    } catch (err) {
        res.status(400).send({
            message: err.message
        })
    }
}

module.exports = {
    userBody,
    loginBody
}