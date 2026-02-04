import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../prisma.js";

const router = Router();

function paramId(req: Request): string {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
}

// List published levels (public)
router.get("/", async (_req: Request, res: Response) => {
  try {
    const levels = await prisma.level.findMany({
      where: { published: true },
      include: {
        createdBy: { select: { id: true, username: true } },
        _count: { select: { completions: true } },
      },
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
        createdBy: level.createdBy,
        createdAt: level.createdAt,
        completionCount: level._count.completions,
      }))
    );
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get single level
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = paramId(req);
    const level = await prisma.level.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, username: true } },
        _count: { select: { completions: true } },
      },
    });

    if (!level) {
      res.status(404).json({ error: "Level not found" });
      return;
    }

    res.json({
      ...level,
      completionCount: level._count.completions,
      _count: undefined,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create level
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const { title, description, data, screenshot } = req.body;
    if (!title || !data) {
      res.status(400).json({ error: "Title and data are required" });
      return;
    }

    const level = await prisma.level.create({
      data: {
        title,
        description,
        data: typeof data === "string" ? data : JSON.stringify(data),
        screenshot,
        createdById: req.user!.userId,
      },
    });

    res.status(201).json(level);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update level
router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const id = paramId(req);
    const level = await prisma.level.findUnique({
      where: { id },
      include: { _count: { select: { completions: true } } },
    });

    if (!level) {
      res.status(404).json({ error: "Level not found" });
      return;
    }
    if (level.createdById !== req.user!.userId) {
      res.status(403).json({ error: "Not authorized" });
      return;
    }
    if (level.published && level._count.completions > 0) {
      res
        .status(403)
        .json({ error: "Cannot edit a published level that has been completed" });
      return;
    }

    const { title, description, data, screenshot } = req.body;
    const updated = await prisma.level.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(data !== undefined && {
          data: typeof data === "string" ? data : JSON.stringify(data),
        }),
        ...(screenshot !== undefined && { screenshot }),
      },
    });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete level
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const id = paramId(req);
    const level = await prisma.level.findUnique({
      where: { id },
      include: { _count: { select: { completions: true } } },
    });

    if (!level) {
      res.status(404).json({ error: "Level not found" });
      return;
    }
    if (level.createdById !== req.user!.userId) {
      res.status(403).json({ error: "Not authorized" });
      return;
    }
    if (level._count.completions > 0) {
      res
        .status(403)
        .json({ error: "Cannot delete a level that has been completed" });
      return;
    }

    await prisma.level.delete({ where: { id } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Publish level
router.post("/:id/publish", requireAuth, async (req: Request, res: Response) => {
  try {
    const id = paramId(req);
    const level = await prisma.level.findUnique({
      where: { id },
    });

    if (!level) {
      res.status(404).json({ error: "Level not found" });
      return;
    }
    if (level.createdById !== req.user!.userId) {
      res.status(403).json({ error: "Not authorized" });
      return;
    }
    if (level.published) {
      res.status(400).json({ error: "Level is already published" });
      return;
    }

    const updated = await prisma.level.update({
      where: { id },
      data: { published: true },
    });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Fork/clone level
router.post("/:id/fork", requireAuth, async (req: Request, res: Response) => {
  try {
    const id = paramId(req);
    const source = await prisma.level.findUnique({ where: { id } });

    if (!source) {
      res.status(404).json({ error: "Level not found" });
      return;
    }
    if (!source.published) {
      res.status(400).json({ error: "Can only fork published levels" });
      return;
    }

    const forked = await prisma.level.create({
      data: {
        title: `Copy of ${source.title}`,
        description: source.description,
        data: source.data,
        screenshot: source.screenshot,
        createdById: req.user!.userId,
      },
    });

    res.status(201).json(forked);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Complete level
router.post("/:id/complete", requireAuth, async (req: Request, res: Response) => {
  try {
    const id = paramId(req);
    const level = await prisma.level.findUnique({
      where: { id },
    });

    if (!level) {
      res.status(404).json({ error: "Level not found" });
      return;
    }
    if (!level.published) {
      res.status(400).json({ error: "Level is not published" });
      return;
    }

    const completion = await prisma.levelCompletion.create({
      data: {
        levelId: id,
        userId: req.user!.userId,
      },
    });

    res.status(201).json(completion);
  } catch (err: any) {
    // Handle unique constraint violation (already completed)
    if (err.code === "P2002") {
      res.status(409).json({ error: "Already completed this level" });
      return;
    }
    res.status(500).json({ error: err.message });
  }
});

export default router;
