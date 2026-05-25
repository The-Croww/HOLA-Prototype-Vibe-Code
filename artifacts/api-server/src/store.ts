export interface UserRecord {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "user" | "psychologist" | "admin";
  avatar: string | null;
  createdAt: string;
}

export interface MoodEntry {
  id: string;
  userId: string;
  moodScore: number;
  emotions: string[];
  note: string | null;
  createdAt: string;
}

export const usersByEmail = new Map<string, UserRecord>();
export const usersById = new Map<string, UserRecord>();
export const moodStore = new Map<string, MoodEntry[]>();

const SEED_ID = "seed-user-001";
const seedUser: UserRecord = {
  id: SEED_ID,
  name: "Alex",
  email: "alex@example.com",
  password: "password123",
  role: "user",
  avatar: null,
  createdAt: new Date().toISOString(),
};
usersByEmail.set(seedUser.email, seedUser);
usersById.set(seedUser.id, seedUser);

const now = Date.now();
moodStore.set(SEED_ID, [
  { id: "m1", userId: SEED_ID, moodScore: 7, emotions: ["Calm", "Grateful"], note: "Good morning", createdAt: new Date(now - 6 * 86400000).toISOString() },
  { id: "m2", userId: SEED_ID, moodScore: 5, emotions: ["Tired", "Anxious"], note: null, createdAt: new Date(now - 5 * 86400000).toISOString() },
  { id: "m3", userId: SEED_ID, moodScore: 6, emotions: ["Calm"], note: "Feeling better", createdAt: new Date(now - 4 * 86400000).toISOString() },
  { id: "m4", userId: SEED_ID, moodScore: 8, emotions: ["Happy", "Energized"], note: null, createdAt: new Date(now - 3 * 86400000).toISOString() },
  { id: "m5", userId: SEED_ID, moodScore: 4, emotions: ["Sad", "Overwhelmed"], note: "Hard day", createdAt: new Date(now - 2 * 86400000).toISOString() },
  { id: "m6", userId: SEED_ID, moodScore: 7, emotions: ["Hopeful", "Calm"], note: null, createdAt: new Date(now - 86400000).toISOString() },
]);
