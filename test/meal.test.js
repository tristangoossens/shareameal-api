const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const database = require('../config/db')
const jwt = require('jsonwebtoken');
const assert = require('assert');

chai.should()
chai.use(chaiHttp)

const clearQuery = 'DELETE IGNORE FROM `meal`; DELETE IGNORE FROM `meal_participants_user`; DELETE IGNORE FROM `user`; ALTER TABLE `meal` AUTO_INCREMENT = 1; ALTER TABLE `user` AUTO_INCREMENT = 1;';

const dummyUserQuery = (email) => {
    return `INSERT INTO user (id, firstName, lastName, emailAdress, password, street, city)
                VALUES (0, "Test", "Tester", "${email}", "Test1234", "Teststraat 14", "Pietstad");`
}
const dummyMealQuery = (cookId) => {
    return `INSERT INTO meal (id, isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, name, description, allergenes, cookId)
    VALUES (0, 1, 1, 1, 1, "2022-05-22 14:30:02", 6, 10.50, "https://www.google.com/", "Testmeal", "Lekkere testmaaltijd", "gluten,lactose", ${cookId});`;
}

describe('ShareAMeal Meal routes', () => {
    describe('UC-301 Register a new meal', () => {
        const mealToInsert = {
            name: "Testmaaltijd",
            description: "Lekkere testmaaltijd",
            isActive: true,
            isVega: true,
            isVegan: true,
            isToTakeHome: true,
            dateTime: "2022-05-22T11:16:33.380Z",
            cookId: 1,
            imageUrl: "https://www.google.com/",
            allergenes: [
                "gluten",
                "noten",
                "lactose"
            ],
            maxAmountOfParticipants: 6,
            price: 6.75
        }

        before((done) => {
            database.getConnection((err, conn) => {
                if (err) throw err;
                conn.query(`${dummyUserQuery("test@mail.com")}`, (err, _) => {
                    if (err) throw err;
                    conn.release();
                    done();
                })
            })
        })

        after((done) => {
            database.getConnection((err, conn) => {
                if (err) throw err;
                conn.query(clearQuery, (err, _) => {
                    if (err) throw err;
                    conn.release();
                    done();
                })
            })
        })


        it('TC-301-1 should return error when required value is not present', (done) => {
            // Clone dummy object
            const meal = Object.assign({}, mealToInsert);

            // Remove required field
            delete meal.name;

            chai.request(server).post('/api/meal').set('authorization', `Bearer ${jwt.sign({ userID: 1 }, process.env.JWT_KEY)}`).send(meal).end((err, res) => {
                assert.ifError(err)

                // Check if a 400 status code was returned with an error message
                res.should.have.status(400)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('message');

                // Disect response object
                let { message } = res.body

                // Check if the error message is correct
                message.should.be.an('string').that.contains('Name must be in string format');

                done()
            })
        })

        it('TC-301-2 should return an error when not authorized', (done) => {
            chai.request(server).post('/api/meal').send(mealToInsert).end((err, res) => {
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

        it('TC-301-3 should return a result object when a correct request is made', (done) => {
            chai.request(server).post('/api/meal').set('authorization', `Bearer ${jwt.sign({ userID: 1 }, process.env.JWT_KEY)}`).send(mealToInsert).end((err, res) => {
                assert.ifError(err)

                // Check if a 201 status code was returned with a result object
                res.should.have.status(201)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('result')

                // Disect response object
                let { result } = res.body

                // Check if the reponse object matches the expected response
                mealToInsert.dateTime = new Date(mealToInsert.dateTime).toISOString().slice(0, 19).replace('T', ' ');
                const expectedResponse = {
                    id: 1,
                    ...mealToInsert
                }

                assert.deepEqual(result, expectedResponse);

                done()
            })
        })
    })

    describe('UC-302 Update meal', () => {
        const mealToUpdate = {
            name: "Testmaaltijd",
            description: "Lekkere testmaaltijd",
            isActive: true,
            isVega: true,
            isVegan: true,
            isToTakeHome: true,
            dateTime: "2022-05-22T11:16:33.380Z",
            cookId: 1,
            imageUrl: "https://www.google.com/",
            allergenes: [
                "gluten",
                "noten",
                "lactose"
            ],
            maxAmountOfParticipants: 6,
            price: 6.75
        }

        before((done) => {
            database.getConnection((err, conn) => {
                if (err) throw err;
                conn.query(`${dummyUserQuery("test@mail.com")} ${dummyMealQuery(1)}`, (err, _) => {
                    if (err) throw err;
                })

                conn.query(`${dummyUserQuery("test2@mail.com")} ${dummyMealQuery(2)}`, (err, _) => {
                    if (err) throw err;
                    conn.release();
                    done();
                })
            })
        })

        after((done) => {
            database.getConnection((err, conn) => {
                if (err) throw err;
                conn.query(clearQuery, (err, _) => {
                    if (err) throw err;
                    conn.release();
                    done();
                })
            })
        })

        it('TC-302-1 should return error when updating a meal with missing required fields', (done) => {
            const meal = Object.assign({}, mealToUpdate);

            delete meal.name;

            chai.request(server).put('/api/meal/1').send(meal).set('authorization', `Bearer ${jwt.sign({ userID: 1 }, process.env.JWT_KEY)}`).end((err, res) => {
                assert.ifError(err)

                // Check if a 400 status code was returned with a error message
                res.should.have.status(400)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('message');

                // Disect response object
                let { message } = res.body

                // Check if the error message is correct
                message.should.equal(message, 'Name must be in string format')

                done()
            })
        })

        it('TC-302-2 should return an error when not authorized', (done) => {
            chai.request(server).put('/api/meal/1').send(mealToUpdate).end((err, res) => {
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

        it('TC-302-3 should return error when editing someone elses data', (done) => {
            chai.request(server).delete('/api/meal/2').send(mealToUpdate).set('authorization', `Bearer ${jwt.sign({ userID: 1 }, process.env.JWT_KEY)}`).end((err, res) => {
                assert.ifError(err)

                // Check if a 403 status code was returned with an error message
                res.should.have.status(403)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('message');

                // Disect response object
                let { message } = res.body

                // Check if the error message is correct
                message.should.equal(message, 'You can only modify your own meals')

                done()
            })
        })

        it('TC-302-4 should return error when editing non-existing meal', (done) => {
            chai.request(server).put('/api/meal/10').send(mealToUpdate).set('authorization', `Bearer ${jwt.sign({ userID: 1 }, process.env.JWT_KEY)}`).end((err, res) => {
                assert.ifError(err)

                // Check if a 404 status code was returned with an error message
                res.should.have.status(404)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('message');

                // Disect response object
                let { message } = res.body

                // Check if the error message is correct
                message.should.equal(message, 'Meal does not exist')

                done()
            })
        })

        it('TC-305-5 should return a updated meal when making a correct request', (done) => {
            chai.request(server).put('/api/meal/1').send(mealToUpdate).set('authorization', `Bearer ${jwt.sign({ userID: 1 }, process.env.JWT_KEY)}`).end((err, res) => {
                assert.ifError(err)

                // Check if a 200 status code was returned with a confirmation message
                res.should.have.status(200)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('result');

                // Disect response object
                let { result } = res.body

                // Check if the result object is correct
                mealToUpdate.dateTime = new Date(mealToUpdate.dateTime).toISOString().slice(0, 19).replace('T', ' ');
                const expectedResponse = {
                    id: "1",
                    ...mealToUpdate
                }

                assert.deepEqual(result, expectedResponse)

                done()
            })
        })
    })

    describe('UC-303 List meals', () => {
        before((done) => {
            database.getConnection((err, conn) => {
                if (err) throw err;
                conn.query(`${dummyUserQuery("test@mail.com")} ${dummyMealQuery(1)}`, (err, _) => {
                    if (err) throw err;
                    conn.release();
                    done();
                })
            })
        })

        after((done) => {
            database.getConnection((err, conn) => {
                if (err) throw err;
                conn.query(clearQuery, (err, _) => {
                    if (err) throw err;
                    conn.release();
                    done();
                })
            })
        })

        it('TC-303-1 should return list of meals when correct request is made', (done) => {
            chai.request(server).get('/api/meal').end((err, res) => {
                assert.ifError(err)

                // Check if a 200 status code was returned with a restult object
                res.should.have.status(200)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('result');

                // Disect response object
                let { result } = res.body

                // Check if the result array contains 1 meal
                result.should.have.length(1);

                done()
            })
        })
    })

    describe('UC-304 Retrieve meal by id', () => {
        before((done) => {
            database.getConnection((err, conn) => {
                if (err) throw err;
                conn.query(`${dummyUserQuery("test@mail.com")} ${dummyMealQuery(1)}`, (err, _) => {
                    if (err) throw err;
                    conn.release();
                    done();
                })
            })
        })

        after((done) => {
            database.getConnection((err, conn) => {
                if (err) throw err;
                conn.query(clearQuery, (err, _) => {
                    if (err) throw err;
                    conn.release();
                    done();
                })
            })
        })

        it('TC-304-1 should return error when retrieving non-existing meal', (done) => {
            chai.request(server).get('/api/meal/10').end((err, res) => {
                assert.ifError(err)

                // Check if a 404 status code was returned with an error message
                res.should.have.status(404)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('message');

                // Disect response object
                let { message } = res.body

                // Check if the error message is correct
                message.should.equal(message, 'Meal does not exist')

                done()
            })
        })

        it('TC-304-2 should return meal when making correct request', (done) => {
            chai.request(server).get('/api/meal/1').end((err, res) => {
                assert.ifError(err)

                // Check if a 200 status code was returned with an error message
                res.should.have.status(200)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('result');

                // Disect response object
                let { result } = res.body


                result.should.be.an('object')

                done()
            })
        })
    })

    describe('UC-305 Delete a meal', () => {
        before((done) => {
            database.getConnection((err, conn) => {
                if (err) throw err;
                conn.query(`${dummyUserQuery("test@mail.com")} ${dummyMealQuery(1)}`, (err, _) => {
                    if (err) throw err;
                })

                conn.query(`${dummyUserQuery("test2@mail.com")} ${dummyMealQuery(2)}`, (err, _) => {
                    if (err) throw err;
                    conn.release();
                    done();
                })
            })
        })

        after((done) => {
            database.getConnection((err, conn) => {
                if (err) throw err;
                conn.query(clearQuery, (err, _) => {
                    if (err) throw err;
                    conn.release();
                    done();
                })
            })
        })

        it('TC-305-2 should return an error when not authorized', (done) => {
            chai.request(server).delete('/api/meal/1').end((err, res) => {
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

        it('TC-305-3 should return error when deleting someone elses data', (done) => {
            chai.request(server).delete('/api/meal/2').set('authorization', `Bearer ${jwt.sign({ userID: 1 }, process.env.JWT_KEY)}`).end((err, res) => {
                assert.ifError(err)

                // Check if a 403 status code was returned with an error message
                res.should.have.status(403)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('message');

                // Disect response object
                let { message } = res.body

                // Check if the error message is correct
                message.should.equal(message, 'You can only modify your own meals')

                done()
            })
        })

        it('TC-305-4 should return error when deleting non-existing meal', (done) => {
            chai.request(server).delete('/api/meal/10').set('authorization', `Bearer ${jwt.sign({ userID: 1 }, process.env.JWT_KEY)}`).end((err, res) => {
                assert.ifError(err)

                // Check if a 404 status code was returned with an error message
                res.should.have.status(404)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('message');

                // Disect response object
                let { message } = res.body

                // Check if the error message is correct
                message.should.equal(message, 'Meal does not exist')

                done()
            })
        })

        it('TC-305-5 should return a delete confirmation when making a correct request', (done) => {
            chai.request(server).delete('/api/meal/1').set('authorization', `Bearer ${jwt.sign({ userID: 1 }, process.env.JWT_KEY)}`).end((err, res) => {
                assert.ifError(err)

                // Check if a 200 status code was returned with a confirmation message
                res.should.have.status(200)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('message');

                // Disect response object
                let { message } = res.body

                // Check if the error message is correct
                message.should.equal(message, `Meal with id '1' has been deleted`)

                done()
            })
        })
    })
})