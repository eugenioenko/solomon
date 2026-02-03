import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../prisma.js";

const router = Router();

// Get current user's levels
router.get("/me/levels", requireAuth, async (req: Request, res: Response) => {
  try {
    const levels = await prisma.level.findMany({
      where: { createdById: req.user!.userId },
      include: { _count: { select: { completions: true } } },
      orderBy: { createdAt: "desc" },
    });

    res.json(
      levels.map((level) => ({
        id: level.id,
        title: level.title,
        description: level.description,
        version: level.version,
        screenshot: level.screenshot,
        published: level.published,
        createdAt: level.createdAt,
        updatedAt: level.updatedAt,
        completionCount: level._count.completions,
        locked: level.published && level._count.completions > 0,
      }))
    );
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get user public profile
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        createdAt: true,
        _count: { select: { levels: { where: { published: true } } } },
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({
      id: user.id,
      username: user.username,
      createdAt: user.createdAt,
      publishedLevelCount: user._count.levels,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
