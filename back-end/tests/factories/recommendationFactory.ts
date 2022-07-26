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

export async function createWrongRecommendation() {
  const recommendation = await prisma.recommendation.create({
    data: {
      name: faker.random.numeric(),
      youtubeLink: faker.color.rgb(),
    },
  });
  return recommendation;
}

export function generateRecommendation() {
  return {
    name: faker.name.findName(),
    youtubeLink: "https://www.youtube.com/watch?v=PNNJksqrz-U",
  };
}
