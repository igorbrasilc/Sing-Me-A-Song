import { faker } from "@faker-js/faker";
import supertest from "supertest";

import app from "../src/app.js";
import { prisma } from "../src/database.js";

const agent = supertest(app);

beforeEach(async () => {});
