import { prisma } from '../../src/database.js'
import { Recommendation } from '@prisma/client'

type RecommendationBody = Omit<Recommendation, 'id' | 'score'>
type RecommendationDB = Omit<Recommendation, 'id'>

export async function createMockRecommendation(score: number) {
    const recommendation = {
        id: 1,
        name: 'Recommendation Title',
        youtubeLink: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
        score: score,
    }
    return recommendation
}

export async function createRecommendationBody() {
    const body: RecommendationBody = {
        name: `Recommendation Title - ${Math.floor(Math.random() * 10000000)}`,
        youtubeLink: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
    }
    return body
}

export async function createRecommendation() {
    const body = await createRecommendationBody()
    const recommendation: RecommendationDB = await prisma.recommendation.create(
        {
            data: {
                name: body.name,
                youtubeLink: body.youtubeLink,
                score: Math.floor(Math.random() * 100),
            },
        }
    )
    return recommendation
}

export async function createRecommendationWithCustomScore(score: number) {
    const body = await createRecommendationBody()
    const recommendation: RecommendationDB = await prisma.recommendation.create(
        {
            data: {
                name: body.name,
                youtubeLink: body.youtubeLink,
                score: score,
            },
        }
    )
    return recommendation
}
