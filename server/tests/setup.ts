import { execSync } from "child_process";
import { beforeEach, afterAll } from "vitest";
import fs from "fs";
import path from "path";

const TEST_DB_PATH = path.join(__dirname, "..", "test.db");

// Set test database URL before any imports
process.env.DATABASE_URL = `file:${TEST_DB_PATH}`;
process.env.JWT_SECRET = "test-secret";
process.env.RP_ID = "localhost";
process.env.RP_NAME = "Solomon Test";
process.env.RP_ORIGIN = "http://localhost:3000";

// Push schema to test database
execSync("npx prisma db push --skip-generate --accept-data-loss", {
  cwd: path.join(__dirname, ".."),
  env: { ...process.env, DATABASE_URL: `file:${TEST_DB_PATH}` },
  stdio: "ignore",
});

// Import prisma after setting env
const { prisma } = await import("../src/prisma.js");

beforeEach(async () => {
  // Clean all tables in dependency order
  await prisma.levelCompletion.deleteMany();
  await prisma.level.deleteMany();
  await prisma.credential.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
  // Clean up test database
  try {
    fs.unlinkSync(TEST_DB_PATH);
    fs.unlinkSync(TEST_DB_PATH + "-journal");
  } catch {}
});
