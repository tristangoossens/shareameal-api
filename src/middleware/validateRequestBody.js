const assert = require('assert');

const userBody = (req, res, next) => {
    try {
        const { firstName, lastName, street, city, password, emailAdress } = req.body;


        assert.equal(typeof firstName == 'string', 'Firstname must be in string format');
        assert.equal(typeof lastName == 'string', 'Lastname must be in string format');
        assert.equal(typeof street == 'string', 'Street must be in string format');
        assert.equal(typeof city == 'string', 'City must be in string format');
        assert.equal(typeof password == 'string', 'Password must be in string format');
        assert.equal(typeof emailAdress == 'string', 'Email must be in string format');

        next()
    } catch (err) {
        res.status(400).send({
            status: 400,
            error: err.message
        })
    }
}

module.exports = {
    userBody
}