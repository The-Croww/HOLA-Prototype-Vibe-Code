import { Router } from "express";
import { usersByEmail, usersById, UserRecord } from "../store";
import { signToken } from "../middleware/auth";

const router = Router();

router.post("/v1/auth/register", (req, res) => {
  const { name, email, password, role } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
  };
  if (!name || !email || !password) {
    res.status(400).json({ error: "Name, email, and password are required" });
    return;
  }
  if (usersByEmail.has(email)) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }
  const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
  const user: UserRecord = {
    id,
    name,
    email,
    password,
    role: role === "psychologist" || role === "admin" ? role : "user",
    avatar: null,
    createdAt: new Date().toISOString(),
  };
  usersByEmail.set(email, user);
  usersById.set(id, user);
  const token = signToken(
    id,
    role === "psychologist" || role === "admin" ? role : "user",
  );
  res.status(201).json({
    token,
    user: {
      id,
      name,
      email,
      role: role === "psychologist" || role === "admin" ? role : "user",
      avatar: null,
      createdAt: user.createdAt,
    },
  });
});

router.post("/v1/auth/login", (req, res) => {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };
  const user = usersByEmail.get(email ?? "");
  if (!user || user.password !== password) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = signToken(user.id, user.role);
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      createdAt: user.createdAt,
    },
  });
});

export default router;
