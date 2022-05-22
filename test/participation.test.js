const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const database = require('../config/db')
const jwt = require('jsonwebtoken');
const assert = require('assert');

chai.should()
chai.use(chaiHttp)

const clearQuery = 'DELETE IGNORE FROM `meal`; DELETE IGNORE FROM `meal_participants_user`; DELETE IGNORE FROM `user`; ALTER TABLE `meal` AUTO_INCREMENT = 1; ALTER TABLE `user` AUTO_INCREMENT = 1; ALTER TABLE `meal_participants_user` AUTO_INCREMENT = 1;';

const dummyUserQuery = (email) => {
    return `INSERT INTO user (id, firstName, lastName, emailAdress, password, street, city)
                VALUES (0, "Test", "Tester", "${email}", "Test1234", "Teststraat 14", "Pietstad");`
}
const dummyMealQuery = (cookId) => {
    return `INSERT INTO meal (id, isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, name, description, allergenes, cookId)
    VALUES (0, 1, 1, 1, 1, "2022-05-22 14:30:02", 6, 10.50, "https://www.google.com/", "Testmeal", "Lekkere testmaaltijd", 'gluten,lactose', ${cookId});`;
}

describe('ShareAMeal Participation routes', () => {
    describe('UC-401 Participate in a meal', () => {
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


        it('TC-401-1 should return an error when not authorized', (done) => {
            chai.request(server).post('/api/meal/1/participate').end((err, res) => {
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

        it('TC-401-2 should return error when participating non-existing meal', (done) => {
            chai.request(server).post('/api/meal/10/participate').set('authorization', `Bearer ${jwt.sign({ userID: 1 }, process.env.JWT_KEY)}`).end((err, res) => {
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

        it('TC-401-3 should return a result object when a correct request is made', (done) => {
            chai.request(server).post('/api/meal/1/participate').set('authorization', `Bearer ${jwt.sign({ userID: 1 }, process.env.JWT_KEY)}`).end((err, res) => {
                assert.ifError(err)

                // Check if a 200 status code was returned with a result object
                res.should.have.status(200)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('result')

                // Disect response object
                let { result } = res.body

                // Check if the reponse object matches the expected response
                assert.deepEqual(result, { mealId: 1, userId: 1 });

                done()
            })
        })
    })

    describe('UC-402 Revoke participation in meal', () => {
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


        it('TC-402-1 should return an error when not authorized', (done) => {
            chai.request(server).put('/api/meal/1/participate').end((err, res) => {
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

        it('TC-402-2 should return error when revoking participation for non-existing meal', (done) => {
            chai.request(server).put('/api/meal/10/participate').set('authorization', `Bearer ${jwt.sign({ userID: 1 }, process.env.JWT_KEY)}`).end((err, res) => {
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

        it('TC-402-3 should return a result object when a correct request is made', (done) => {
            chai.request(server).put('/api/meal/1/participate').set('authorization', `Bearer ${jwt.sign({ userID: 1 }, process.env.JWT_KEY)}`).end((err, res) => {
                assert.ifError(err)

                // Check if a 200 status code was returned with a result object
                res.should.have.status(200)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('message')

                // Disect response object
                let { message } = res.body

                // Check if the reponse object matches the expected response
                assert.deepEqual(message, `Participation for meal with id '1' has been revoked`);

                done()
            })
        })
    })
})