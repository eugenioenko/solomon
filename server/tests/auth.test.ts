import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { createTestUser } from "./helpers.js";

describe("Auth routes", () => {
  describe("POST /api/auth/register/options", () => {
    it("rejects empty username", async () => {
      const res = await request(app)
        .post("/api/auth/register/options")
        .send({ username: "" });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/username/i);
    });

    it("rejects short username", async () => {
      const res = await request(app)
        .post("/api/auth/register/options")
        .send({ username: "a" });
      expect(res.status).toBe(400);
    });

    it("rejects missing username", async () => {
      const res = await request(app)
        .post("/api/auth/register/options")
        .send({});
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/auth/register/verify", () => {
    it("rejects missing fields", async () => {
      const res = await request(app)
        .post("/api/auth/register/verify")
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/missing/i);
    });

    it("rejects missing response", async () => {
      const res = await request(app)
        .post("/api/auth/register/verify")
        .send({ username: "testuser" });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/auth/login/options", () => {
    it("rejects missing username", async () => {
      const res = await request(app)
        .post("/api/auth/login/options")
        .send({});
      expect(res.status).toBe(400);
    });

    it("rejects non-existent user", async () => {
      const res = await request(app)
        .post("/api/auth/login/options")
        .send({ username: "nobody" });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/not found/i);
    });
  });

  describe("POST /api/auth/login/verify", () => {
    it("rejects missing fields", async () => {
      const res = await request(app)
        .post("/api/auth/login/verify")
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/missing/i);
    });
  });

  describe("GET /api/auth/me", () => {
    it("returns 401 without token", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(401);
    });

    it("returns 401 with invalid token", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid-token");
      expect(res.status).toBe(401);
    });

    it("returns user with valid token", async () => {
      const { user, token } = await createTestUser();
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(user.id);
      expect(res.body.username).toBe(user.username);
    });
  });
});
