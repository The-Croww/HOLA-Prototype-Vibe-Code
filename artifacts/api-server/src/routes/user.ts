import { Router } from "express";
import { usersById } from "../store";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

const AFFIRMATIONS = [
  "You are capable of amazing things.",
  "Every step forward is progress.",
  "Your feelings are valid.",
  "Today is full of possibility.",
  "You are stronger than you think.",
  "Taking care of yourself is an act of strength.",
  "Small steps lead to big changes.",
  "You deserve kindness — especially from yourself.",
  "Your wellbeing matters deeply.",
  "Progress, not perfection.",
  "Be gentle with yourself today.",
  "Healing isn't linear — and that's okay.",
  "Your effort counts, even when it's invisible.",
  "Today, rest is also productive.",
];

router.get("/v1/users/me", authMiddleware, (req: AuthRequest, res) => {
  const userId = req.userId!;
  const user = usersById.get(userId);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    createdAt: user.createdAt,
  });
});

router.get("/v1/affirmation", authMiddleware, (_req, res) => {
  const dayIndex = new Date().getDate() % AFFIRMATIONS.length;
  res.json({
    text: AFFIRMATIONS[dayIndex],
    date: new Date().toISOString().split("T")[0],
  });
});

export default router;
