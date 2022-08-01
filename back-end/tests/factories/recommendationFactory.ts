import { faker } from "@faker-js/faker";
import { prisma } from "../../src/database";
import { Recommendation } from "@prisma/client";

export async function createRecommendation() {
  const recommendation = await prisma.recommendation.create({
    data: {
      name: faker.name.findName(),
      youtubeLink: "https://www.youtube.com/watch?v=PNNJksqrz-U",
    },
  });
  return recommendation;
}

export function generateXRecommendations(X: number) {
  const recommendations = [];
  for (let i = 0; i < X - 1; i++) {
    recommendations.push({
      name: faker.random.words(2),
      youtubeLink: "https://www.youtube.com/watch?v=PNNJksqrz-U",
    } as Recommendation);
  }
  return recommendations;
}

export async function createXRecommendations(X: number) {
  const recommendations = generateXRecommendations(X);
  await prisma.recommendation.createMany({ data: recommendations });
  return recommendations;
}

export async function updateXScores(X: number, update: number) {
  await createXRecommendations(X);
  await prisma.recommendation.updateMany({ data: { score: update } });
}

export async function createAndGetRecommendation() {
  const recommendation = await createRecommendation();
  const recommendationCreated = await prisma.recommendation.findFirst({
    where: { name: recommendation.name },
  });
  return recommendationCreated;
}

export async function getRecommendation(id: number) {
  const recommendation = await prisma.recommendation.findFirst({
    where: { id },
  });
  return recommendation;
}

export function generateRecommendation() {
  return {
    name: faker.name.findName(),
    youtubeLink: "https://www.youtube.com/watch?v=PNNJksqrz-U",
  };
}

export function generateWrongRecommendation() {
  return {
    name: 123,
    youtubeLink: "string",
  };
}
