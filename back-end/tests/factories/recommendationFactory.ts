import { faker } from "@faker-js/faker";
import { prisma } from "../../src/database";

export async function createRecommendation() {
  const recommendation = await prisma.recommendation.create({
    data: {
      name: faker.name.findName(),
      youtubeLink: "https://www.youtube.com/watch?v=PNNJksqrz-U",
    },
  });
  return recommendation;
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
