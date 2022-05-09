import { jest } from '@jest/globals'
import { recommendationRepository } from '../../src/repositories/recommendationRepository.js'
import { recommendationService } from '../../src/services/recommendationsService.js'
import { createMockRecommendation } from '../factories/RecommendationFactory.js'

describe('UNIT TESTING', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.resetAllMocks()
    })

    // --------------------------- INSERT RECOMMENDATION---------------------------

    describe('Create Recommendation - POST /recommendation ', () => {
        it('should return status 409(conflict) when an recommendation name is already registered (unique)', async () => {
            const recommendation = await createMockRecommendation(0)
            const body = {
                name: recommendation.name,
                youtubeLink: recommendation.youtubeLink,
            }
            jest.spyOn(
                recommendationRepository,
                'findByName'
            ).mockResolvedValue(recommendation)
            expect(recommendationService.insert(body)).rejects.toEqual({
                message: 'Recommendations names must be unique',
                type: 'conflict',
            })
        })
    })

    // --------------------------- UPVOTE RECOMMENDATION---------------------------

    describe('Upvote Recommendation - POST /recommendation/:id/upvote', () => {
        it('should return status 404 (not found) when a invalid recommendationId is sent', async () => {
            const id = 0
            jest.spyOn(recommendationRepository, 'find').mockResolvedValue(null)
            expect(recommendationService.upvote(id)).rejects.toEqual({
                message: '',
                type: 'not_found',
            })
        })
    })

    // --------------------------- DOWNVOTE RECOMMENDATION---------------------------

    describe('Downvote Recommendation - POST /recommendation/:id/downvote', () => {
        beforeEach(() => {
            jest.clearAllMocks()
            jest.resetAllMocks()
        })
        it('should return status 404 (not found) when a invalid recommendationId is sent', async () => {
            const id = 0
            jest.spyOn(recommendationRepository, 'find').mockResolvedValue(null)
            expect(recommendationService.downvote(id)).rejects.toEqual({
                message: '',
                type: 'not_found',
            })
        })

        it('should remove a recommendation when a score becomes equal to less than -5', async () => {
            const recommendation = await createMockRecommendation(-6)

            jest.spyOn(recommendationRepository, 'find').mockResolvedValue(
                recommendation
            )

            const updatedScore = jest
                .spyOn(recommendationRepository, 'updateScore')
                .mockResolvedValue(recommendation)

            const remove = jest
                .spyOn(recommendationRepository, 'remove')
                .mockResolvedValue(null)

            await recommendationService.downvote(recommendation.id)
            expect(updatedScore).toHaveBeenCalledTimes(1)
            expect(remove).toHaveBeenCalledTimes(1)
        })
    })

    // --------------------------- GET RANDOM RECOMMENDATION---------------------------

    describe('Get random recommendation - GET /recommendations/random', () => {
        beforeEach(() => {
            jest.clearAllMocks()
            jest.resetAllMocks()
        })

        it('should return error 404 (not_found) when no random recommendations are found', async () => {
            const randomValue = 0.6
            jest.spyOn(global.Math, 'random').mockReturnValue(randomValue)
            jest.spyOn(
                recommendationRepository,
                'findAll'
            ).mockResolvedValueOnce([])
            expect(recommendationService.getRandom()).rejects.toEqual({
                message: '',
                type: 'not_found',
            })
        })

        it('getScoreFilter -> should return lte when a score is greater than 0.7', () => {
            const randomNumber = 1
            jest.spyOn(global.Math, 'random').mockReturnValueOnce(randomNumber)
            const getScoreFilter =
                recommendationService.getScoreFilter(randomNumber)
            expect(getScoreFilter).toBe('lte')
        })

        it('getScoreFilter -> should return gt when a score is lower than 0.7', () => {
            const randomNumber = 0.1
            jest.spyOn(global.Math, 'random').mockReturnValueOnce(randomNumber)
            const getScoreFilter =
                recommendationService.getScoreFilter(randomNumber)
            expect(getScoreFilter).toBe('gt')
        })

        it('getByScore -> should return recommendations if recommendations.length is greater than 0', async () => {
            const mockRecommendation = await createMockRecommendation(0)
            jest.spyOn(recommendationRepository, 'findAll').mockResolvedValue([
                mockRecommendation,
            ])
            const getByScore = await recommendationService.getByScore('lte')
            expect(getByScore).toEqual([mockRecommendation])
        })
    })
})
