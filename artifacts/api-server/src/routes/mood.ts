import { Router } from "express";
import { moodStore, MoodEntry } from "../store";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/v1/mood", authMiddleware, (req: AuthRequest, res) => {
  const userId = req.userId!;
  const limit = Number(req.query["limit"]) || 30;
  const offset = Number(req.query["offset"]) || 0;
  const entries = (moodStore.get(userId) ?? []).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  res.json({ entries: entries.slice(offset, offset + limit), total: entries.length });
});

router.post("/v1/mood", authMiddleware, (req: AuthRequest, res) => {
  const userId = req.userId!;
  const { moodScore, emotions, note } = req.body as {
    moodScore?: number;
    emotions?: string[];
    note?: string | null;
  };
  if (!moodScore || moodScore < 1 || moodScore > 10) {
    res.status(400).json({ error: "moodScore must be 1–10" });
    return;
  }
  const entry: MoodEntry = {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
    userId,
    moodScore,
    emotions: emotions ?? [],
    note: note ?? null,
    createdAt: new Date().toISOString(),
  };
  const existing = moodStore.get(userId) ?? [];
  moodStore.set(userId, [...existing, entry]);
  res.status(201).json(entry);
});

router.get("/v1/mood/today", authMiddleware, (req: AuthRequest, res) => {
  const userId = req.userId!;
  const today = new Date().toDateString();
  const entries = moodStore.get(userId) ?? [];
  const entry =
    entries.find((e) => new Date(e.createdAt).toDateString() === today) ?? null;
  res.json({ entry });
});

export default router;
