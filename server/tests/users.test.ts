import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/prisma.js";
import { createTestUser, createTestLevel } from "./helpers.js";

describe("User routes", () => {
  describe("GET /api/users/me/levels", () => {
    it("returns 401 without auth", async () => {
      const res = await request(app).get("/api/users/me/levels");
      expect(res.status).toBe(401);
    });

    it("returns user levels with locked flag", async () => {
      const { user, token } = await createTestUser("creator");
      // Draft level
      await createTestLevel(user.id, { title: "Draft" });
      // Published level with a completion (should be locked)
      const published = await createTestLevel(user.id, {
        title: "Published & Completed",
        published: true,
      });
      const { user: player } = await createTestUser("player");
      await prisma.levelCompletion.create({
        data: { levelId: published.id, userId: player.id },
      });

      const res = await request(app)
        .get("/api/users/me/levels")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);

      const lockedLevel = res.body.find(
        (l: any) => l.title === "Published & Completed"
      );
      const draftLevel = res.body.find((l: any) => l.title === "Draft");
      expect(lockedLevel.locked).toBe(true);
      expect(lockedLevel.completionCount).toBe(1);
      expect(draftLevel.locked).toBe(false);
    });
  });

  describe("GET /api/users/:id", () => {
    it("returns user public profile", async () => {
      const { user } = await createTestUser("profileuser");
      await createTestLevel(user.id, { published: true });
      await createTestLevel(user.id, { published: false });

      const res = await request(app).get(`/api/users/${user.id}`);
      expect(res.status).toBe(200);
      expect(res.body.username).toBe("profileuser");
      expect(res.body.publishedLevelCount).toBe(1);
    });

    it("returns 404 for non-existent user", async () => {
      const res = await request(app).get("/api/users/nonexistent");
      expect(res.status).toBe(404);
    });
  });
});
