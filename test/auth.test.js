const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const database = require('../config/db')

const assert = require('assert');

chai.should()
chai.use(chaiHttp)

const clearQuery = 'DELETE IGNORE FROM `meal`; DELETE IGNORE FROM `meal_participants_user`; DELETE IGNORE FROM `user`; ALTER TABLE `user` AUTO_INCREMENT = 1;';
const dummyUserQuery = (email) => {
    return `INSERT INTO user (id, firstName, lastName, emailAdress, password, street, city)
    VALUES (0, "Test", "Tester", "${email}", "Test1234", "Teststraat 14", "Pietstad");`
}

describe('ShareAMeal Auth routes', () => {
    describe('UC-101 Login to existing user', () => {
        const userLoginDetails = {
            emailAdress: 'test@mail.com',
            password: 'Test1234'
        }

        before((done) => {
            database.getConnection((err, conn) => {
                if (err) throw err;
                conn.query(`${dummyUserQuery('test@mail.com')}`, (err, _) => {
                    if (err) throw err;
                    conn.release();
                    done();
                })
            })
        })

        after((done) => {
            database.getConnection((err, conn) => {
                if (err) throw err;
                conn.query(`${clearQuery}`, (err, _) => {
                    if (err) throw err;
                    conn.release();
                    done();
                })
            })
        })


        it('TC-101-1 should return error when required value is not present', (done) => {
            // Clone dummy object
            const login = Object.assign({}, userLoginDetails);

            // Remove required field
            delete login.password;

            chai.request(server).post('/api/auth/login').send(login).end((err, res) => {
                assert.ifError(err)

                // Check if a 400 status code was returned with an error message
                res.should.have.status(400)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('message');

                // Disect response object
                let { message } = res.body

                // Check if the error message is correct
                message.should.be.an('string').that.contains('Password must be in string format');

                done()
            })
        })

        it('TC-101-2 should return error when a non-valid email is passed in', (done) => {
            // Clone dummy object
            const login = Object.assign({}, userLoginDetails);

            // Set invalid email address
            login.emailAdress = 'test@mail';

            chai.request(server).post('/api/auth/login').send(login).end((err, res) => {
                assert.ifError(err)

                // Check if a 400 status code was returned with an error message
                res.should.have.status(400)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('message');

                // Disect response object
                let { message } = res.body

                // Check if the error message is correct
                message.should.be.an('string').that.contains('Email must be in valid e-mail format');

                done()
            })
        })

        it('TC-101-2 should return error when a non-valid password is passed in', (done) => {
            // Clone dummy object
            const login = Object.assign({}, userLoginDetails);

            // Set invalid email address
            login.password = 'password'; // No number in password

            chai.request(server).post('/api/auth/login').send(login).end((err, res) => {
                assert.ifError(err)

                // Check if a 400 status code was returned with an error message
                res.should.have.status(400)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('message');

                // Disect response object
                let { message } = res.body

                // Check if the error message is correct
                message.should.be.an('string').that.contains('Password must be 8 characters long and contain a number and a letter');

                done()
            })
        })

        it('TC-101-4 should return error when user is not found', (done) => {
            // Clone dummy object
            const login = Object.assign({}, userLoginDetails);

            // Change to unknown email
            login.emailAdress = 'notfound@gmail.com'

            chai.request(server).post('/api/auth/login').send(login).end((err, res) => {
                assert.ifError(err)

                // Check if a 404 status code was returned with an error message
                res.should.have.status(404)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('message');

                // Disect response object
                let { message } = res.body

                // Check if the error message is correct
                message.should.be.an('string').that.contains('User does not exist');

                done()
            })
        })

        it('TC-101-5 should return user info and token when correct request is made', (done) => {
            chai.request(server).post('/api/auth/login').send(userLoginDetails).end((err, res) => {
                assert.ifError(err)

                // Check if a 200 status code was returned with a result object
                res.should.have.status(200)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('result');

                // Disect response object
                let { result } = res.body

                // Check if the response object contains all keys
                result.should.be.an('object').that.has.all.keys('id', 'firstName', 'lastName', 'isActive', 'emailAdress', 'phoneNumber', 'roles', 'street', 'city', 'token');

                done()
            })
        })
    })
})