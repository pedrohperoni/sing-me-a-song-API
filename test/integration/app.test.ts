import app from '../../src/app.js'
import supertest from 'supertest'
import { prisma } from '../../src/database.js'
import {
    createRecommendationBody,
    createRecommendation,
    createRecommendationWithCustomScore,
} from '../factories/RecommendationFactory.js'

describe('INTEGRATION TESTING', () => {
    beforeAll(truncateRecommendations)
    afterAll(truncateRecommendations)
    afterAll(disconnect)

    // --------------------------- INSERT RECOMMENDATION---------------------------

    describe('Create Recommendation - POST /recommendation ', () => {
        beforeAll(truncateRecommendations)
        afterAll(disconnect)

        it('should return status 201 when a valid body is given, and persist the video', async () => {
            const body = await createRecommendationBody()
            const response = await supertest(app)
                .post('/recommendations')
                .send(body)
            expect(response.status).toBe(201)
        })

        it('should return status 422 when a wrong schema is requested (testing joi)', async () => {
            const body = {}
            const response = await supertest(app)
                .post('/recommendations')
                .send(body)
            expect(response.status).toBe(422)
        })
    })

    // --------------------------- INCREMENT RECOMMENDATION SCORE---------------------------

    describe('Upvote Recommendation - POST /recommendation/:id/upvote', () => {
        beforeAll(truncateRecommendations)
        afterAll(disconnect)
        it('should return status 200 when a upvote is successfully sent, and persist the updated score', async () => {
            const newRecommendation = await createRecommendation()
            const originalRecommendation =
                await prisma.recommendation.findUnique({
                    where: { name: newRecommendation.name },
                })
            const response = await supertest(app).post(
                `/recommendations/${originalRecommendation.id}/upvote`
            )
            const updatedRecommendation =
                await prisma.recommendation.findUnique({
                    where: { id: originalRecommendation.id },
                })
            expect(response.status).toBe(200)
            expect(updatedRecommendation.score).toBe(
                originalRecommendation.score + 1
            )
        })
    })

    // --------------------------- DECREASE RECOMMENDATION SCORE---------------------------

    describe('Downvote Recommendation - POST /recommendation/:id/upvote', () => {
        beforeAll(truncateRecommendations)
        afterAll(disconnect)
        it('should return status 200 when a downvote is successfully sent, and persist the updated score', async () => {
            const newRecommendation = await createRecommendation()
            const originalRecommendation =
                await prisma.recommendation.findUnique({
                    where: { name: newRecommendation.name },
                })
            const response = await supertest(app).post(
                `/recommendations/${originalRecommendation.id}/downvote`
            )
            const updatedRecommendation =
                await prisma.recommendation.findUnique({
                    where: { id: originalRecommendation.id },
                })
            expect(response.status).toBe(200)
            expect(updatedRecommendation.score).toBe(
                originalRecommendation.score - 1
            )
        })
    })

    // --------------------------- GET RANDOM RECOMMENDATION---------------------------

    describe('Get a random recommendation - GET /recommendations/random', () => {
        beforeAll(truncateRecommendations)
        afterAll(disconnect)
        it('should return a random recommendation already registered in the database', async () => {
            const recommendation = await createRecommendation()
            const response = await supertest(app).get('/recommendations/random')
            expect(response.body).toEqual(recommendation)
        })
    })

    // --------------------------- GET ALL RECOMMENDATIONS---------------------------

    describe('Get all recommendations - GET /recommendations', () => {
        beforeAll(truncateRecommendations)
        afterAll(disconnect)
        it('should return all recommendations already registered in the database', async () => {
            const recommendation = await createRecommendation()
            const response = await supertest(app).get('/recommendations')
            expect(response.body).toEqual([recommendation])
        })
    })

    // --------------------------- GET TOP RECOMMENDATIONS---------------------------

    describe('Get top (amount:3) recommendations by descending score - GET /recommendations/top/:amount', () => {
        beforeAll(truncateRecommendations)
        afterAll(disconnect)
        it('should return the top(amount) recommendations sorted by score (descending)', async () => {
            const firstRecommendation =
                await createRecommendationWithCustomScore(100)
            const lastRecommendation =
                await createRecommendationWithCustomScore(2)
            const secondRecommendation =
                await createRecommendationWithCustomScore(50)
            const response = await supertest(app).get('/recommendations/top/3')
            expect(response.body[0]).toEqual(firstRecommendation)
            expect(response.body[1]).toEqual(secondRecommendation)
            expect(response.body[2]).toEqual(lastRecommendation)
        })
    })

    // --------------------------- GET RECOMMENDATION BY ID---------------------------

    describe('Get recommendation by id - GET /recommendations/:id', () => {
        beforeAll(truncateRecommendations)
        afterAll(disconnect)
        it('should return the correct recommendation ', async () => {
            const recommendation = await createRecommendation()
            const createdRecommendation =
                await prisma.recommendation.findUnique({
                    where: { name: recommendation.name },
                })
            const response = await supertest(app).get(
                `/recommendations/${createdRecommendation.id}`
            )
            expect(response.body).toEqual(recommendation)
        })
    })
})

async function truncateRecommendations() {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations`
}

async function disconnect() {
    await prisma.$disconnect()
}
