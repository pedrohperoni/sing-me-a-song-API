import app from "../../src/app.js";
import supertest from "supertest"
import { prisma } from "../../src/database.js";

describe("Integration Tests", () => {
  afterAll(disconnect);
  beforeAll(truncateRecommendations);
  it("basic route, testing test & db settings, coverage", async () => {
    const video = {
      name: "Test",
      youtubeLink: "https://www.youtube.com/watch?v=0oq974EmpBo",
    };

    const response = await supertest(app).post("/recommendations").send(video);
    expect(response.status).toBe(201);
  });
});

async function truncateRecommendations() {
  await prisma.$executeRaw`TRUNCATE TABLE recommendations`;
}

async function disconnect() {
  await prisma.$disconnect();
}
