import supertest from "supertest";
import * as scenarioFactory from "../factories/scenarioFactory.js";
import * as recommendationFactory from "../factories/recommendationFactory.js";

import app from "../../src/app.js";
import { prisma } from "../../src/database.js";

const agent = supertest(app);

beforeEach(async () => {
  await scenarioFactory.deleteAllData();
});

describe("recommendation test suite", () => {
  it("should create a recommendation", async () => {
    const recommendation = recommendationFactory.generateRecommendation();
    const response = await agent.post("/recommendations").send(recommendation);
    expect(response.statusCode).toBe(201);
    const recommendationCreated = await prisma.recommendation.findMany();
    expect(recommendationCreated.length).toBe(1);
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});
