import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/prisma.js";
import { createTestUser, createTestLevel } from "./helpers.js";

describe("Level routes", () => {
  describe("GET /api/levels", () => {
    it("returns empty array when no published levels", async () => {
      const res = await request(app).get("/api/levels");
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it("returns only published levels", async () => {
      const { user } = await createTestUser();
      await createTestLevel(user.id, { title: "Draft", published: false });
      await createTestLevel(user.id, { title: "Published", published: true });

      const res = await request(app).get("/api/levels");
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].title).toBe("Published");
    });

    it("includes completion count and creator info", async () => {
      const { user } = await createTestUser("creator");
      const level = await createTestLevel(user.id, { published: true });
      const { user: player } = await createTestUser("player");
      await prisma.levelCompletion.create({
        data: { levelId: level.id, userId: player.id },
      });

      const res = await request(app).get("/api/levels");
      expect(res.status).toBe(200);
      expect(res.body[0].completionCount).toBe(1);
      expect(res.body[0].createdBy.username).toBe("creator");
    });
  });

  describe("GET /api/levels/:id", () => {
    it("returns 404 for non-existent ID", async () => {
      const res = await request(app).get("/api/levels/nonexistent");
      expect(res.status).toBe(404);
    });

    it("returns level with completion count", async () => {
      const { user } = await createTestUser();
      const level = await createTestLevel(user.id, { published: true });

      const res = await request(app).get(`/api/levels/${level.id}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(level.id);
      expect(res.body.completionCount).toBe(0);
    });
  });

  describe("POST /api/levels", () => {
    it("returns 401 without auth", async () => {
      const res = await request(app)
        .post("/api/levels")
        .send({ title: "Test", data: "{}" });
      expect(res.status).toBe(401);
    });

    it("creates a level", async () => {
      const { token } = await createTestUser();
      const res = await request(app)
        .post("/api/levels")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "My Level", data: '{"tiles":[]}' });
      expect(res.status).toBe(201);
      expect(res.body.title).toBe("My Level");
      expect(res.body.published).toBe(false);
    });

    it("rejects missing title", async () => {
      const { token } = await createTestUser();
      const res = await request(app)
        .post("/api/levels")
        .set("Authorization", `Bearer ${token}`)
        .send({ data: "{}" });
      expect(res.status).toBe(400);
    });

    it("rejects missing data", async () => {
      const { token } = await createTestUser();
      const res = await request(app)
        .post("/api/levels")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Test" });
      expect(res.status).toBe(400);
    });
  });

  describe("PUT /api/levels/:id", () => {
    it("returns 401 without auth", async () => {
      const { user } = await createTestUser();
      const level = await createTestLevel(user.id);
      const res = await request(app)
        .put(`/api/levels/${level.id}`)
        .send({ title: "Updated" });
      expect(res.status).toBe(401);
    });

    it("rejects non-owner", async () => {
      const { user } = await createTestUser("owner");
      const level = await createTestLevel(user.id);
      const { token: otherToken } = await createTestUser("other");

      const res = await request(app)
        .put(`/api/levels/${level.id}`)
        .set("Authorization", `Bearer ${otherToken}`)
        .send({ title: "Hijacked" });
      expect(res.status).toBe(403);
    });

    it("updates level successfully", async () => {
      const { user, token } = await createTestUser();
      const level = await createTestLevel(user.id);

      const res = await request(app)
        .put(`/api/levels/${level.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Updated Title" });
      expect(res.status).toBe(200);
      expect(res.body.title).toBe("Updated Title");
    });

    it("rejects edit on completed published level", async () => {
      const { user, token } = await createTestUser("creator");
      const level = await createTestLevel(user.id, { published: true });
      const { user: player } = await createTestUser("player");
      await prisma.levelCompletion.create({
        data: { levelId: level.id, userId: player.id },
      });

      const res = await request(app)
        .put(`/api/levels/${level.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Nope" });
      expect(res.status).toBe(403);
    });

    it("allows edit on published level with no completions", async () => {
      const { user, token } = await createTestUser();
      const level = await createTestLevel(user.id, { published: true });

      const res = await request(app)
        .put(`/api/levels/${level.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Still Editable" });
      expect(res.status).toBe(200);
    });
  });

  describe("DELETE /api/levels/:id", () => {
    it("deletes level successfully", async () => {
      const { user, token } = await createTestUser();
      const level = await createTestLevel(user.id);

      const res = await request(app)
        .delete(`/api/levels/${level.id}`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const deleted = await prisma.level.findUnique({
        where: { id: level.id },
      });
      expect(deleted).toBeNull();
    });

    it("rejects delete on completed level", async () => {
      const { user, token } = await createTestUser("creator");
      const level = await createTestLevel(user.id, { published: true });
      const { user: player } = await createTestUser("player");
      await prisma.levelCompletion.create({
        data: { levelId: level.id, userId: player.id },
      });

      const res = await request(app)
        .delete(`/api/levels/${level.id}`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(403);
    });

    it("returns 404 for non-existent level", async () => {
      const { token } = await createTestUser();
      const res = await request(app)
        .delete("/api/levels/nonexistent")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/levels/:id/publish", () => {
    it("publishes a level", async () => {
      const { user, token } = await createTestUser();
      const level = await createTestLevel(user.id);

      const res = await request(app)
        .post(`/api/levels/${level.id}/publish`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.published).toBe(true);
    });

    it("rejects already published level", async () => {
      const { user, token } = await createTestUser();
      const level = await createTestLevel(user.id, { published: true });

      const res = await request(app)
        .post(`/api/levels/${level.id}/publish`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(400);
    });

    it("rejects non-owner publish", async () => {
      const { user } = await createTestUser("owner");
      const level = await createTestLevel(user.id);
      const { token: otherToken } = await createTestUser("other");

      const res = await request(app)
        .post(`/api/levels/${level.id}/publish`)
        .set("Authorization", `Bearer ${otherToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe("POST /api/levels/:id/complete", () => {
    it("records completion", async () => {
      const { user } = await createTestUser("creator");
      const level = await createTestLevel(user.id, { published: true });
      const { token: playerToken } = await createTestUser("player");

      const res = await request(app)
        .post(`/api/levels/${level.id}/complete`)
        .set("Authorization", `Bearer ${playerToken}`);
      expect(res.status).toBe(201);
    });

    it("rejects duplicate completion", async () => {
      const { user } = await createTestUser("creator");
      const level = await createTestLevel(user.id, { published: true });
      const { user: player, token: playerToken } =
        await createTestUser("player");
      await prisma.levelCompletion.create({
        data: { levelId: level.id, userId: player.id },
      });

      const res = await request(app)
        .post(`/api/levels/${level.id}/complete`)
        .set("Authorization", `Bearer ${playerToken}`);
      expect(res.status).toBe(409);
    });

    it("rejects unpublished level", async () => {
      const { user } = await createTestUser("creator");
      const level = await createTestLevel(user.id, { published: false });
      const { token: playerToken } = await createTestUser("player");

      const res = await request(app)
        .post(`/api/levels/${level.id}/complete`)
        .set("Authorization", `Bearer ${playerToken}`);
      expect(res.status).toBe(400);
    });

    it("returns 401 without auth", async () => {
      const { user } = await createTestUser();
      const level = await createTestLevel(user.id, { published: true });

      const res = await request(app).post(`/api/levels/${level.id}/complete`);
      expect(res.status).toBe(401);
    });
  });
});
