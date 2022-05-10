const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const assert = require('assert')

chai.should()
chai.use(chaiHttp)

describe('Share a meal API', () => {
    describe('UC-201 Register a new user', () => {
        beforeEach(() => {

        })


        it('TC-201-1 should return error when required value is not present', (done) => {
            chai.request(server).post('/api/users').send({
                lastName: "Tester",
                street: "Teststraat 14",
                city: "Pietstad",
                emailAdress: "y.pieters@student.avans.nl",
                password: "mooi123",
                phoneNumber: "06 12425475"
            }).end((err, res) => {
                // Check if a 400 status code was returned with an error message
                assert.ifError(err)
                res.should.have.status(400)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('status', 'error')

                // Disect response object
                let { status, error } = res.body
                status.should.be.an('number')

                // Check if the error message is correct
                error.should.be.an('string').that.contains('Firstname must be in string format');

                done()
            })
        })
    })
})