const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const database = require('../config/db')
const assert = require('assert')
const { before, after } = require('mocha')
const { send } = require('process')
const jwt = require('jsonwebtoken');

chai.should()
chai.use(chaiHttp)

const clearQuery = 'DELETE IGNORE FROM `meal`; DELETE IGNORE FROM `meal_participants_user`; DELETE IGNORE FROM `user`; ALTER TABLE `meal` AUTO_INCREMENT = 1; ALTER TABLE `user` AUTO_INCREMENT = 1; ALTER TABLE `meal_participants_user` AUTO_INCREMENT = 1;';
const dummyUserQuery = (email) => {
    return `INSERT INTO user (id, firstName, lastName, emailAdress, password, street, city)
    VALUES (0, "Test", "Tester", "${email}", "Test1234", "Teststraat 14", "Pietstad");`
}


describe('ShareAMeal User routes', () => {
    describe('UC-201 Register a new user', () => {
        const userToInsert = {
            firstName: "Test",
            lastName: "Tester",
            street: "Teststraat 14",
            city: "Pietstad",
            emailAdress: "y.pieters@student.avans.nl",
            password: "Test1234",
            phoneNumber: "06 12425475"
        }


        beforeEach((done) => {
            database.getConnection((err, conn) => {
                if (err) throw err;
                conn.query(`${dummyUserQuery('test@mail.com')}`, (err, _) => {
                    if (err) throw err;
                    conn.release();
                    done();
                })
            })
        })

        afterEach((done) => {
            database.getConnection((err, conn) => {
                if (err) throw err;
                conn.query(`${clearQuery}`, (err, _) => {
                    if (err) throw err;
                    conn.release();
                    done();
                })
            })
        })


        it('TC-201-1 should return error when required value is not present', (done) => {
            // Clone dummy object
            const user = Object.assign({}, userToInsert);

            // Remove required field
            delete user.firstName

            chai.request(server).post('/api/user').send(user).end((err, res) => {
                assert.ifError(err)

                // Check if a 400 status code was returned with an error message
                res.should.have.status(400)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('message');

                // Disect response object
                let { message } = res.body

                // Check if the error message is correct
                message.should.be.an('string').that.contains('Firstname must be in string format');

                done()
            })
        })

        it('TC-201-2 should return error when inserting non-valid email', (done) => {
            // Clone dummy object
            const user = Object.assign({}, userToInsert);

            // Set email to invalid mail format
            user.emailAdress = 'test@mail'

            chai.request(server).post('/api/user').send(user).end((err, res) => {
                assert.ifError(err)

                // Check if a 400 status code was returned with an error message
                res.should.have.status(400)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('message')

                // Disect response object
                let { message } = res.body

                // Check if the error message is correct
                message.should.be.an('string').that.contains(`Email must be in valid e-mail format`);

                done()
            })
        })

        it('TC-201-3 should return error when inserting non-valid password', (done) => {
            // Clone dummy object
            const user = Object.assign({}, userToInsert);

            // Set password to invalid password format
            user.password = 'password'

            chai.request(server).post('/api/user').send(user).end((err, res) => {
                assert.ifError(err)

                // Check if a 400 status code was returned with an error message
                res.should.have.status(400)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('message')

                // Disect response object
                let { message } = res.body

                // Check if the error message is correct
                message.should.be.an('string').that.contains(`Password must be 8 characters long and contain a number and a letter`);

                done()
            })
        })

        it('TC-201-4 should return error when inserting duplicate email', (done) => {
            // Clone dummy object
            const user = Object.assign({}, userToInsert);

            // Set email to existing email
            user.emailAdress = 'test@mail.com'

            chai.request(server).post('/api/user').send(user).end((err, res) => {
                assert.ifError(err)

                // Check if a 409 status code was returned with an error message
                res.should.have.status(409)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('message')

                // Disect response object
                let { message } = res.body

                // Check if the error message is correct
                message.should.be.an('string').that.contains(`Requested user with email 'test@mail.com' already exists`);

                done()
            })
        })

        it('TC-201-5 correct request should succesfully create a new user', (done) => {
            chai.request(server).post('/api/user').send(userToInsert).end((err, res) => {
                assert.ifError(err)

                // Check if a succesful response of 201 was received
                res.should.have.status(201)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('result');

                // Disect response object
                let { result } = res.body

                const expectedResponse = {
                    id: 2, // First to be added after dummy user
                    ...userToInsert
                }

                // Check if the expected result matches the response
                assert.deepEqual(result, expectedResponse);

                done()
            })
        })
    })

    describe('UC-202 List users', () => {
        before((done) => {
            database.getConnection((err, conn) => {
                if (err) throw err;
                for (let i = 0; i < 5; i++) {
                    conn.query(dummyUserQuery(`test@mail${i}.com`), (err, _) => {
                        if (err) throw err;
                    })
                }

                conn.release();
                done();
            });
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

        it('TC-202-1 should a list of zero users', (done) => {
            chai.request(server).get('/api/user?limit=0').set('authorization', `Bearer ${jwt.sign({ userID: 1 }, process.env.JWT_KEY)}`).end((err, res) => {
                assert.ifError(err)

                // Check if a 200 status code was returned with a response object
                res.should.have.status(200)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('result')

                // Disect response object
                let { result } = res.body

                // Check if the result is a empty array
                assert.deepEqual(result, []);

                done()
            })
        });

        it('TC-202-2 should a list of two users', (done) => {
            chai.request(server).get('/api/user?limit=2').set('authorization', `Bearer ${jwt.sign({ userID: 1 }, process.env.JWT_KEY)}`).end((err, res) => {
                assert.ifError(err)

                // Check if a 200 status code was returned with a response object
                res.should.have.status(200)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('result')

                // Disect response object
                let { result } = res.body

                // Check if the result array contains 2 users
                result.should.have.length(2);
                done()
            })
        })

        it('TC-202-3 should return empty list of users when entering nonexisting name', (done) => {
            chai.request(server).get('/api/user?firstName=idontexist').set('authorization', `Bearer ${jwt.sign({ userID: 1 }, process.env.JWT_KEY)}`).end((err, res) => {
                assert.ifError(err)

                // Check if a 200 status code was returned with a response object
                res.should.have.status(200)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('result')

                // Disect response object
                let { result } = res.body

                // Check if the result array contains 0 users
                result.should.have.length(0);
                assert.deepEqual(result, []);
                done()
            })
        })

        it('TC-202-4 should return a list of inactive users when entered in query', (done) => {
            chai.request(server).get('/api/user?isActive=false').set('authorization', `Bearer ${jwt.sign({ userID: 1 }, process.env.JWT_KEY)}`).end((err, res) => {
                assert.ifError(err)

                // Check if a 200 status code was returned with a response object
                res.should.have.status(200)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('result')

                // Disect response object
                let { result } = res.body

                // Check if the result array contains 0 users
                result.should.have.length(0);
                assert.deepEqual(result, []);
                done()
            })
        })

        it('TC-202-5 should return a list of active users when entered in query', (done) => {
            chai.request(server).get('/api/user?isActive=true').set('authorization', `Bearer ${jwt.sign({ userID: 1 }, process.env.JWT_KEY)}`).end((err, res) => {
                assert.ifError(err)

                // Check if a 200 status code was returned with a response object
                res.should.have.status(200)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('result')

                // Disect response object
                let { result } = res.body

                // Check if the result array contains 5 users
                result.should.have.length(5);
                done()
            })
        })

        it('TC-202-6 should return a list of users with firstname', (done) => {
            chai.request(server).get('/api/user?firstName=Test').set('authorization', `Bearer ${jwt.sign({ userID: 1 }, process.env.JWT_KEY)}`).end((err, res) => {
                assert.ifError(err)

                // Check if a 200 status code was returned with a response object
                res.should.have.status(200)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('result')

                // Disect response object
                let { result } = res.body

                // Check if the result array contains 5 users
                result.should.have.length(5);
                done()
            })
        })

        it('TC-202-7 should return an error when not authorized', (done) => {
            chai.request(server).get('/api/user').end((err, res) => {
                assert.ifError(err)

                // Check if a 401 status code was returned with a error message
                res.should.have.status(401)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('message')

                // Disect response object
                let { message } = res.body

                // Check if the error message is correct
                message.should.equal(message, 'Authorization header missing!')

                done()
            })
        })
    });

    describe('UC-203 Profile information', () => {
        before((done) => {
            database.getConnection((err, conn) => {
                if (err) throw err;

                conn.query(dummyUserQuery('test@mail.com'), (err, _) => {
                    if (err) throw err;
                })

                conn.release();
                done();
            });
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

        it('TC-203-1 should return message when not authorized', (done) => {
            chai.request(server).get('/api/user/profile').end((err, res) => {
                assert.ifError(err)

                // Check if a 401 status code was returned with a not implemented error
                res.should.have.status(401)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('message')

                // Disect response object
                let { message } = res.body

                // Check if the error message is correct
                message.should.equal(message, 'Authorization header missing!');

                done()
            })
        });

        it('TC-203-2 should return profile info when correct request is made', (done) => {
            chai.request(server).get('/api/user/profile').set('authorization', `Bearer ${jwt.sign({ userID: 1 }, process.env.JWT_KEY)}`).end((err, res) => {
                assert.ifError(err)

                // Check if a 501 status code was returned with a not implemented error
                res.should.have.status(200)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('result')

                // Disect response object
                let { result } = res.body

                // Check if the response body is correct
                const expectedResponse = {
                    id: 1,
                    firstName: "Test",
                    lastName: "Tester",
                    street: "Teststraat 14",
                    city: "Pietstad",
                    emailAdress: "test@mail.com",
                    password: "Test1234",
                    phoneNumber: "-",
                    isActive: 1,
                    roles: 'editor,guest'
                }
                assert.deepEqual(result, expectedResponse)

                done()
            })
        });
    });

    describe('UC-204 User details', () => {
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

        it('TC-204-1 should return error when requesting non existing user', (done) => {
            chai.request(server).get('/api/user/10').set('authorization', `Bearer ${jwt.sign({ userID: 1 }, process.env.JWT_KEY)}`).end((err, res) => {
                assert.ifError(err)

                // Check if a 404 status code was returned with an error
                res.should.have.status(404)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('message')

                // Disect response object
                let { message } = res.body

                // Check if the error message is correct
                message.should.equal(message, `Requested user with id '10' was not found`)

                done()
            })
        });

        it('TC-204-2 correct request should return a user', (done) => {
            chai.request(server).get('/api/user/1').set('authorization', `Bearer ${jwt.sign({ userID: 1 }, process.env.JWT_KEY)}`).end((err, res) => {
                assert.ifError(err)

                // Check if a 200 status code was returned with a response body
                res.should.have.status(200)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('result')

                // Disect response object
                let { result } = res.body

                // User that is inserted before running the test
                const expectedUser = {
                    id: 1,
                    firstName: "Test",
                    lastName: "Tester",
                    street: "Teststraat 14",
                    city: "Pietstad",
                    phoneNumber: "-",
                    isActive: 1,
                    roles: "editor,guest",
                    emailAdress: "test@mail.com",
                    password: "Test1234",
                }

                // Check if the response is equal to the expected repsonse
                assert.deepEqual(result, expectedUser);

                done()
            })
        });

        it('TC-204-3 should return an error when not authorized', (done) => {
            chai.request(server).get('/api/user/1').end((err, res) => {
                assert.ifError(err)

                // Check if a 401 status code was returned with a error message
                res.should.have.status(401)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('message')

                // Disect response object
                let { message } = res.body

                // Check if the error message is correct
                message.should.equal(message, 'Authorization header missing!')

                done()
            })
        })
    });

    describe('UC-205 Updating a user', () => {
        const userToUpdate = {
            firstName: 'Test',
            lastName: "Tester",
            street: "Teststraat 14",
            city: "Pietstad",
            emailAdress: "testing@mail.com",
            password: "Test1234",
            phoneNumber: "06 12425475"
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

        it('TC-205-1 missing a required field', (done) => {
            // Clone existing object
            const user = Object.assign({}, userToUpdate);

            // Remove required field
            delete user.city;

            chai.request(server).put('/api/user/1').send(user).set('authorization', `Bearer ${jwt.sign({ userID: 1 }, process.env.JWT_KEY)}`).end((err, res) => {
                assert.ifError(err)

                // Check if a 400 status code was returned with an error
                res.should.have.status(400)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('message')

                // Disect response object
                let { message } = res.body

                // Check if the error message is correct
                message.should.equal(message, 'City must be in string format')

                done()
            })
        });

        it('TC-205-3 should return an error when passing invalid phone number', (done) => {
            // Clone existing object
            const user = Object.assign({}, userToUpdate);

            // set phonenumber to invalid number
            user.phoneNumber = "thisisnotaphonenumber";

            chai.request(server).put('/api/user/1').send(user).set('authorization', `Bearer ${jwt.sign({ userID: 1 }, process.env.JWT_KEY)}`).end((err, res) => {
                assert.ifError(err)

                // Check if a 400 status code was returned with an error
                res.should.have.status(400)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('message')

                // Disect response object
                let { message } = res.body

                // Check if the error message is correct
                message.should.equal(message, 'Phonenumber must be in valid phonenumber format')

                done()
            })
        });


        it('TC-205-4 updating a user that does not exist', (done) => {
            chai.request(server).put('/api/user/10').send(userToUpdate).set('authorization', `Bearer ${jwt.sign({ userID: 1 }, process.env.JWT_KEY)}`).end((err, res) => {
                assert.ifError(err)

                // Check if a 400 status code was returned with an error
                res.should.have.status(400)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('message')

                // Disect response object
                let { message } = res.body

                // Check if the error message is correct
                message.should.equal(message, `Requested user with id '10' was not found`)

                done()
            })
        });

        it('TC-205-5 should return an error when not authorized', (done) => {
            chai.request(server).put('/api/user/1').end((err, res) => {
                assert.ifError(err)

                // Check if a 401 status code was returned with a error message
                res.should.have.status(401)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('message')

                // Disect response object
                let { message } = res.body

                // Check if the error message is correct
                message.should.equal(message, 'Authorization header missing!')

                done()
            })
        })


        it('TC-205-6 succesfull update request', (done) => {
            chai.request(server).put('/api/user/1').send(userToUpdate).set('authorization', `Bearer ${jwt.sign({ userID: 1 }, process.env.JWT_KEY)}`).end((err, res) => {
                assert.ifError(err)

                // Check if a 200 status code was returned with a response body
                res.should.have.status(200)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('result')

                // Disect response object
                let { result } = res.body

                const expectedResult = {
                    id: 1,
                    ...userToUpdate
                }

                // Check whether the response equals the expected response
                assert.deepEqual(result, expectedResult);

                done()
            })
        });
    });

    describe('UC-206 Deleting a user', () => {
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

        it('TC-206-1 should return error when deleting a non existing user', (done) => {
            chai.request(server).delete('/api/user/10').set('authorization', `Bearer ${jwt.sign({ userID: 1 }, process.env.JWT_KEY)}`).end((err, res) => {
                assert.ifError(err)

                // Check if a 200 status code was returned with a response body
                res.should.have.status(400)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('message')

                // Disect response object
                let { message } = res.body

                // Check if the error message is correct
                message.should.equal(message, `Requested user with id '10' was not found`)

                done()
            })
        });

        it('TC-206-2 should return an error when not authorized', (done) => {
            chai.request(server).delete('/api/user/1').end((err, res) => {
                assert.ifError(err)

                // Check if a 403 status code was returned with a error message
                res.should.have.status(401)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('message')

                // Disect response object
                let { message } = res.body

                // Check if the error message is correct
                message.should.equal(message, 'Authorization header missing!')

                done()
            })
        })

        it('TC-206-3 should return an error deleting other user than token', (done) => {
            chai.request(server).delete('/api/user/1').set('authorization', `Bearer ${jwt.sign({ userID: 2 }, process.env.JWT_KEY)}`).end((err, res) => {
                assert.ifError(err)

                // Check if a 403 status code was returned with a error message
                res.should.have.status(403)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('message')

                // Disect response object
                let { message } = res.body

                // Check if the error message is correct
                message.should.equal(message, 'Authorization header missing!')

                done()
            })
        })

        it('TC-206-4 succesful request should delete given user', (done) => {
            chai.request(server).delete('/api/user/1').set('authorization', `Bearer ${jwt.sign({ userID: 1 }, process.env.JWT_KEY)}`).end((err, res) => {
                assert.ifError(err)

                // Check if a 200 status code was returned a response body
                res.should.have.status(200)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('message')

                // Disect response object
                let { message } = res.body

                // Check if the response message is correct
                message.should.equal(message, `User with id '1' has been deleted`)

                done()
            })
        });
    });
});