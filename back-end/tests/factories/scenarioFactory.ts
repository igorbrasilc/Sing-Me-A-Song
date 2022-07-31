import { prisma } from "../../src/database";
import * as recommendationFactory from "./recommendationFactory.js";

export async function createScenarioWithOneRecommendation() {
  const recommendation = await recommendationFactory.createRecommendation();
  return recommendation;
}

export async function createScenarioWithOTwoRecommendations() {
  const recommendation1 = await recommendationFactory.createRecommendation();
  const recommendation2 = await recommendationFactory.createRecommendation();

  return {
    recommendations: { recommendation1, recommendation2 },
  };
}

export async function deleteAllData() {
  await prisma.$transaction([
    prisma.$executeRaw`TRUNCATE TABLE recommendations CASCADE`,
  ]);
}
