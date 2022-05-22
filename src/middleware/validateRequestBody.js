const assert = require('assert');

const userBody = (req, res, next) => {
    try {
        const { firstName, lastName, street, city, password, emailAdress, phoneNumber } = req.body;


        assert(typeof firstName === 'string', 'Firstname must be in string format');
        assert(typeof lastName === 'string', 'Lastname must be in string format');
        assert(typeof street === 'string', 'Street must be in string format');
        assert(typeof city === 'string', 'City must be in string format');
        assert(typeof password === 'string', 'Password must be in string format');
        assert(typeof emailAdress === 'string', 'Email must be in string format');

        // Extra validation email regex
        const emailRegex = new RegExp(/.+@[^@]+\.[^@]{2,}$/);
        assert.match(emailAdress, emailRegex, 'Email must be in valid e-mail format')

        // Extra validation for email
        const passwordRegex = new RegExp(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/);
        assert.match(password, passwordRegex, 'Password must be 8 characters long and contain a number and a letter')

        // If phonenumber is set check the regex
        if (phoneNumber) {
            const phoneNumberRegex = new RegExp(/^\(?([+]31|0031|0)-?6(\s?|-)([0-9]\s{0,3}){8}$/);
            assert.match(phoneNumber, phoneNumberRegex, 'Phonenumber must be in valid phonenumber format')
        }

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

        // Extra validation email regex
        const emailRegex = new RegExp(/.+@[^@]+\.[^@]{2,}$/);
        assert.match(emailAdress, emailRegex, 'Email must be in valid e-mail format');

        // Extra validation for email
        const passwordRegex = new RegExp(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/);
        assert.match(password, passwordRegex, 'Password must be 8 characters long and contain a number and a letter')

        next();
    } catch (err) {
        res.status(400).send({
            message: err.message
        })
    }
}

const mealBody = (req, res, next) => {
    try {
        const { name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, imageUrl, cookId, allergenes, maxAmountOfParticipants, price } = req.body;

        assert(typeof name === 'string', 'Name must be in string format');
        assert(typeof description === 'string', 'Description must be in string format');
        assert(typeof isActive === 'boolean', 'isActive must be in boolean format');
        assert(typeof isVega === 'boolean', 'isVega must be in boolean format');
        assert(typeof isVegan === 'boolean', 'isVegan must be in boolean format');
        assert(typeof isToTakeHome === 'boolean', 'isToTakeHome must be in boolean format');
        assert(typeof dateTime === 'string', 'dateTime must be in string format');
        assert(typeof imageUrl === 'string', 'imageUrl must be in string format');
        assert(typeof cookId === 'number', 'cookId must be in number format')
        assert.equal(Array.isArray(allergenes), true, 'allergenes must be in array format');
        assert(typeof maxAmountOfParticipants === 'number', 'maxAmountOfParticipants must be in number format');
        assert(typeof price === 'number', 'price must be in number format');

        next();
    } catch (err) {
        res.status(400).send({
            message: err.message
        })
    }
}

module.exports = {
    userBody,
    loginBody,
    mealBody
}