const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const database = require('../config/db')
const assert = require('assert')
const { before, after } = require('mocha')
const { send } = require('process')

chai.should()
chai.use(chaiHttp)

const clearQuery = 'DELETE IGNORE FROM `meal`; DELETE IGNORE FROM `meal_participants_user`; DELETE IGNORE FROM `user`; ALTER TABLE `user` AUTO_INCREMENT = 1;';
const dummyUserQuery = (email) => {
    return `INSERT INTO user (id, firstName, lastName, emailAdress, password, street, city)
    VALUES (0, "Test", "Tester", "${email}", "mooi123", "Teststraat 14", "Pietstad");`
}


describe('ShareAMeal User routes', () => {
    describe('UC-201 Register a new user', () => {
        const userToInsert = {
            firstName: "Test",
            lastName: "Tester",
            street: "Teststraat 14",
            city: "Pietstad",
            emailAdress: "y.pieters@student.avans.nl",
            password: "mooi123",
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

        it('TC-201-2 should return error when inserting existing email', (done) => {
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

        it('TC-201-3 correct request should succesfully create a new user', (done) => {
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
            chai.request(server).get('/api/user').end((err, res) => {
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
            database.getConnection((err, conn) => {
                if (err) throw err;
                for (let i = 0; i < 2; i++) {
                    conn.query(dummyUserQuery(`test@mail${i}.com`), (err, _) => {
                        if (err) throw err;
                    })
                }

                conn.release();
            });

            chai.request(server).get('/api/user').end((err, res) => {
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
    });

    describe('UC-203 Profile information', () => {
        it('TC-203-1 should return message not implemented', (done) => {
            chai.request(server).get('/api/user/profile').end((err, res) => {
                assert.ifError(err)

                // Check if a 501 status code was returned with a not implemented error
                res.should.have.status(501)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('message')

                // Disect response object
                let { message } = res.body

                // Check if the error message is correct
                message.should.equal(message, 'This endpoint is yet to be implemented into this API')

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
            chai.request(server).get('/api/user/10').end((err, res) => {
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
            chai.request(server).get('/api/user/1').end((err, res) => {
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
                    password: "mooi123",
                }

                // Check if the response is equal to the expected repsonse
                assert.deepEqual(result, expectedUser);

                done()
            })
        });
    });

    describe('UC-205 Updating a user', () => {
        const userToUpdate = {
            firstName: 'Test',
            lastName: "Tester",
            street: "Teststraat 14",
            city: "Pietstad",
            emailAdress: "testing@mail.com",
            password: "mooi123",
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

            chai.request(server).put('/api/user/1').send(user).end((err, res) => {
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


        it('TC-205-2 updating a user that does not exist', (done) => {
            chai.request(server).put('/api/user/10').send(userToUpdate).end((err, res) => {
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


        it('TC-205-3 succesfull update request', (done) => {
            chai.request(server).put('/api/user/1').send(userToUpdate).end((err, res) => {
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
            chai.request(server).delete('/api/user/10').end((err, res) => {
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

        it('TC-206-2 succesful request should delete given user', (done) => {
            chai.request(server).delete('/api/user/1').end((err, res) => {
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