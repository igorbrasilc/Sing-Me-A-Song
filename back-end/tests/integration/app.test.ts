import supertest from "supertest";
import * as scenarioFactory from "../factories/scenarioFactory.js";
import * as recommendationFactory from "../factories/recommendationFactory.js";

import app from "../../src/app.js";
import { prisma } from "../../src/database.js";
import recommendationRepository from "../../src/repositories/recommendationRepository.js";
import { jest } from "@jest/globals";
import bodyParser from "body-parser";

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

  it("should not create a recommendation with an existing name", async () => {
    const recommendation = recommendationFactory.generateRecommendation();
    const recommendationOne = await agent
      .post("/recommendations")
      .send(recommendation);
    expect(recommendationOne.statusCode).toBe(201);
    const recommendationCreated = await prisma.recommendation.findMany();
    expect(recommendationCreated.length).toBe(1);
    const recommendationTwo = await agent
      .post("/recommendations")
      .send(recommendation);
    expect(recommendationTwo.statusCode).toBe(409);
    expect(recommendationCreated.length).toBe(1);
  });

  it("should not create a recommendation with wrong schema", async () => {
    const recommendation = recommendationFactory.generateWrongRecommendation();
    const recommendationCreation = await agent
      .post("/recommendations")
      .send(recommendation);
    expect(recommendationCreation.statusCode).toBe(422);
    const recommendationCreated = await prisma.recommendation.findMany();
    expect(recommendationCreated.length).toBe(0);
  });
});

describe("upvoting and downvoting test suite", () => {
  it("it should not upvote a recommendation id that doesnt exist", async () => {
    const recommendationWithAbsentId = await agent
      .post("/recommendations/1/upvote")
      .send({});
    expect(recommendationWithAbsentId.statusCode).toBe(404);
  });

  it("it should upvote (increase by 1) the score number of an existing recommendation", async () => {
    const created = await recommendationFactory.createAndGetRecommendation();
    await agent.post(`/recommendations/${created.id}/upvote`).send({});
    const upvoted = await recommendationFactory.getRecommendation(+created.id);
    expect(upvoted.score).toEqual(created.score + 1);
  });

  it("it should not downvote a recommendation id that doesnt exist", async () => {
    const recommendationWithAbsentId = await agent
      .post("/recommendations/1/downvote")
      .send({});
    expect(recommendationWithAbsentId.statusCode).toBe(404);
  });

  it("it should downvote (decrease by 1) the score number of an existing recommendation with a score above -5", async () => {
    jest.spyOn(recommendationRepository, "remove");
    const created = await recommendationFactory.createAndGetRecommendation();
    await agent.post(`/recommendations/${created.id}/downvote`).send({});
    const downvoted = await recommendationFactory.getRecommendation(
      +created.id
    );
    expect(downvoted.score).toEqual(created.score - 1);
    expect(recommendationRepository.remove).not.toBeCalled();
  });

  it("it should delete a recommendation with a score below -5 after downvoting (decreasing by 1)", async () => {
    jest.spyOn(recommendationRepository, "remove");
    const created = await recommendationFactory.createAndGetRecommendation();
    const updateScore = await prisma.recommendation.update({
      data: { score: -6 },
      where: { id: created.id },
    });
    await agent.post(`/recommendations/${created.id}/downvote`).send({});
    expect(recommendationRepository.remove).toBeCalled();
    const getRemoved = await recommendationFactory.getRecommendation(
      +created.id
    );
    expect(getRemoved).toBe(null);
  });
});

describe("getting recommendations test suite", () => {
  it("should get all recommendations", async () => {
    await recommendationFactory.createXRecommendations(20);
    const result: any = await agent.get("/recommendations");
    expect(result._body.length).toEqual(10);
  });
  it("should get a specific recommendation", async () => {
    const recommendation =
      await recommendationFactory.createAndGetRecommendation();
    const result: any = await agent.get(
      `/recommendations/${recommendation.id}`
    );
    expect(result._body).toEqual(recommendation);
  });
  it("should get a random recommendation 70%", async () => {
    const FIXED_RANDOM = 0.2;
    jest.spyOn(Math, "random").mockReturnValueOnce(FIXED_RANDOM);
    await recommendationFactory.updateXScores(20, 5);
    await recommendationFactory.updateXScores(1, 20);

    const result: any = await agent.get("/recommendations/random");
    expect(result._body.score).toBeGreaterThan(10);
  });
  it("should get a random recommendation 30%", async () => {
    const FIXED_RANDOM = 0.8;
    jest.spyOn(Math, "random").mockReturnValueOnce(FIXED_RANDOM);
    await recommendationFactory.updateXScores(40, 20);
    await recommendationFactory.updateXScores(1, 5);

    const result: any = await agent.get("/recommendations/random");
    expect(result._body.score).toBeLessThanOrEqual(10);
  });
  it("should not get a random recommendation if there are no recommendations", async () => {
    const FIXED_RANDOM = 0.75;
    jest.spyOn(Math, "random").mockReturnValueOnce(FIXED_RANDOM);

    const result: any = await agent.get("/recommendations/random");
    expect(result.statusCode).toBe(404);
  });
  it("should get a amount number of recommendations ordered by top scores", async () => {
    const TOP_SCORE = 30;
    const MEDIUM_SCORE = 20;
    const LOW_SCORE = 0;
    await recommendationFactory.updateXScores(5, TOP_SCORE);
    await recommendationFactory.updateXScores(5, MEDIUM_SCORE);
    await recommendationFactory.updateXScores(5, LOW_SCORE);

    const AMOUNT = 10;
    const result = await agent.get("/recommendations/top/" + AMOUNT);
    expect(result.body.length).toBe(AMOUNT);
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});
