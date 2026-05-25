import { Router, Request, Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT = `You are HOLA Buddy, a warm, non-judgmental AI wellness companion inside the HOLA! Life Buddy app. You support users with evidence-based techniques drawn from CBT (Cognitive Behavioral Therapy) and DBT (Dialectical Behavior Therapy). Your tone is friendly, calm, and encouraging — like a caring friend who also knows psychology. Keep responses concise (2–4 sentences max unless guiding an exercise). Never diagnose. Always encourage professional help for serious concerns. When a user seems in crisis, gently direct them to their psychologist or a helpline. You can guide breathing exercises, suggest journaling prompts, help reframe negative thoughts, and celebrate small wins. Always validate feelings before offering techniques.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

router.post(
  "/v1/chat",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { messages } = req.body as { messages: ChatMessage[] };

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "messages array is required" });
      }

      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
          ],
          max_tokens: 1024,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        console.error("Groq error:", err);
        return res.status(502).json({ error: "AI service unavailable" });
      }

      const data = await response.json();
      const text =
        data.choices?.[0]?.message?.content ??
        "I'm here with you. Could you tell me more?";

      return res.json({ message: { role: "assistant", content: text } });
    } catch (err) {
      console.error("Chat error:", err);
      return res.status(500).json({ error: "Failed to get response" });
    }
  },
);

export default router;
