export type Category =
  | "date"
  | "trip"
  | "food"
  | "random"
  | "celebration"
  | "special_moment";

export type BucketCategory =
  | "travel"
  | "food"
  | "experience"
  | "milestone"
  | "learning"
  | "home"
  | "other";

export type FutureCategory =
  | "dream"
  | "goal"
  | "place"
  | "promise"
  | "letter"
  | "other";

export type Mood =
  | "happy"
  | "good"
  | "neutral"
  | "sad"
  | "angry"
  | "tired"
  | "loved";

export type BucketStatus = "planned" | "in_progress" | "completed";

export type QuizStatus = "in_progress" | "completed";

export interface Profile {
  id: string;
  fullName: string;
  nickname?: string;
  birthday?: string;
  avatarUrl?: string;
  email?: string;
}

export interface Couple {
  id: string;
  coupleName?: string;
  relationshipStartDate: string;
  coverImageUrl?: string;
  theme: "default" | "warm" | "forest" | "midnight";
  inviteCode: string;
  partnerA: Profile;
  partnerB?: Profile;
  createdAt: string;
}

export interface MemoryImage {
  id: string;
  memoryId: string;
  url: string;
  position: number;
}

export interface Memory {
  id: string;
  coupleId: string;
  createdBy: string;
  caption?: string;
  memoryDate: string;
  location?: string;
  category: Category;
  isFavorite: boolean;
  tags: string[];
  images: MemoryImage[];
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  coupleId: string;
  createdBy: string;
  title: string;
  eventDate: string;
  description?: string;
  imageUrl?: string;
  location?: string;
  createdAt: string;
}

export interface LoveLetter {
  id: string;
  coupleId: string;
  senderId: string;
  recipientId?: string;
  title: string;
  content: string;
  imageUrl?: string;
  openWhenTag?: string;
  unlockAt?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface BucketItem {
  id: string;
  coupleId: string;
  createdBy: string;
  title: string;
  description?: string;
  category?: BucketCategory;
  targetDate?: string;
  status: BucketStatus;
  completedDate?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface PlaylistItem {
  id: string;
  coupleId: string;
  songTitle: string;
  artist?: string;
  url: string;
  memoryId?: string;
  addedBy: string;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  coupleId: string;
  createdBy: string;
  questionText: string;
  options: string[];
  correctOptionIndex?: number;
  createdAt: string;
}

export interface QuizAnswer {
  id: string;
  sessionId: string;
  questionId: string;
  selectedOptionIndex: number;
  isCorrect: boolean;
  answeredAt: string;
}

export interface QuizSession {
  id: string;
  coupleId: string;
  playerId: string;
  status: QuizStatus;
  score?: number;
  startedAt: string;
  completedAt?: string;
  answers?: QuizAnswer[];
}

export interface DailyMood {
  id: string;
  coupleId: string;
  userId: string;
  mood: Mood;
  note?: string;
  moodDate: string;
  createdAt: string;
}

export interface FutureItem {
  id: string;
  coupleId: string;
  createdBy: string;
  title: string;
  description?: string;
  category?: FutureCategory;
  targetDate?: string;
  unlockDate?: string;
  createdAt: string;
}

export type AchievementTriggerType =
  | "days_together"
  | "memory_count"
  | "bucket_completed"
  | "trip_count";

export interface Achievement {
  id: string;
  code: string;
  title: string;
  description?: string;
  icon: string;
  triggerType: AchievementTriggerType;
  triggerValue: Record<string, number>;
}

export interface UserAchievement {
  id: string;
  coupleId: string;
  achievementId: string;
  achievement: Achievement;
  unlockedAt: string;
}