/* eslint-disable no-undef */
import chai from 'chai'
import chaiHttp from 'chai-http'
import 'chai/register-should'
import jwt from 'jsonwebtoken'
import app from '../app'
import { validParty, invalidParty, validUser, invalidDataParty } from './testData'

const partyUrl = '/api/v1/parties'

chai.use(chaiHttp)
const { expect } = chai

describe('Testing the party endpoints', () => {
    const token = jwt.sign({ id: validUser.id }, process.env.JWT_KEY, { expiresIn: '1h' })
    it('should create a party', done => {
        chai
            .request(app)
            .post(partyUrl)
            .set('Authorization', `Bearer ${token}`)
            .send(validParty)
            .end((err, res) => {
                expect(res.status).to.equal(201)
            })
        done()
    })

    it('Should not create a party with incomplete required fields', done => {
        chai
            .request(app)
            .post(partyUrl)
            .set('Authorization', `Bearer ${token}`)
            .send(invalidParty)
            .end((err, res) => {
                expect(res.status).to.equal(400)
                expect(res.body.status).to.equal('error')
                done()
            })
    })

    it('Should throw an error if something wrong happens while creating a party', done => {
        // In this test case, we are trying to create a party with an invalid title.
        chai
            .request(app)
            .post(partyUrl)
            .set('Authorization', `Bearer ${token}`)
            .send(invalidDataParty)
            .end((err, res) => {
                expect(res.status).to.equal(400)
                done()
            })
    })

    it('Should fetch parties for a given user', done => {
        chai
            .request(app)
            .get(`${partyUrl}/createdby/1`)
            .send()
            .end((err, res) => {
                expect(res.status).to.equal(200)
                expect(res.body.data.count).to.equal(1)
                done()
            })
    })

    it('Should throw an error when something goes wrong while fetching user parties', done => {
        chai
            .request(app)
        //In this test case, we are trying to provide a string as a parameter but am integer is expected. Therefore, an error will be thrown and our test will pass.
            .get(`${partyUrl}/createdby/invalidstringinput`)
            .send()
            .end((err, res) => {
                expect(res.status).to.equal(400)
                expect(res.body.status).to.equal('error')
                done()
            })
    })
})
