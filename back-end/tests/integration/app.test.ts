import supertest from "supertest";
import * as scenarioFactory from "../factories/scenarioFactory.js";
import * as recommendationFactory from "../factories/recommendationFactory.js";

import app from "../../src/app.js";
import { prisma } from "../../src/database.js";
import recommendationRepository from "../../src/repositories/recommendationRepository.js";
import { jest } from "@jest/globals";

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
  it.todo("should get all recommendations");
  it.todo("should get a specific recommendation");
  it.todo("should get a random recommendation");
  it.todo(
    "should get a amount number of recommendations ordered by top scores"
  );
});

afterAll(async () => {
  await prisma.$disconnect();
});
