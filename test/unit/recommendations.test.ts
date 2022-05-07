import { jest } from "@jest/globals";
import { recommendationRepository } from "../../src/repositories/recommendationRepository.js";
import { recommendationService } from "../../src/services/recommendationsService.js";
import { conflictError } from "../../src/utils/errorUtils.js";
import { createMockRecommendation } from "../factories/RecommentationFactory.js";

describe("UNIT TESTING", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });
  // --------------------------- INSERT RECOMMENDATION---------------------------

  describe("Create Recommendation - POST /recommendation ", () => {
    it("should return status 409(Conflict) when an recommendation name is already registered (unique)", async () => {
      const recommendation = await createMockRecommendation();
      const body = {
        name: recommendation.name,
        youtubeLink: recommendation.youtubeLink,
      };
      jest
        .spyOn(recommendationRepository, "findByName")
        .mockResolvedValue(recommendation);
      expect(recommendationService.insert(body)).rejects.toEqual({
        message: "Recommendations names must be unique",
        type: "conflict",
      });
    });

    it.todo("services: upvote/downvote - getByIdOrFail");
    it.todo("services: downvote - updatedRecommendation -  repositoty: remove ")
    it.todo("services: getRandom - getByScore");
    it.todo("services: getScoreFilter - gt x lte");
  });
});
