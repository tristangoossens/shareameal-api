const assert = require('assert');

const userBody = (req, res, next) => {
    try {
        const {firstname, lastname, street, city, password, email} = req.body;

    
        assert.equal(typeof firstname == 'string', 'Firstname must be in string format');
        assert.equal(typeof lastname == 'string', 'Lastname must be in string format');

        next()
    } catch(err) {
        res.status(403).send({
            status: 403,
            error: err.message
        })
    }
}