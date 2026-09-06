import { relations } from "drizzle-orm";
import {
  profiles,
  couples,
  coupleMembers,
  memories,
  memoryImages,
  timelineEvents,
  loveLetters,
  bucketListItems,
  playlists,
  quizQuestions,
  quizSessions,
  quizAnswers,
  dailyMoods,
  futureItems,
  achievements,
  userAchievements,
} from "./index";

export const profilesRelations = relations(profiles, ({ many }) => ({
  memberships: many(coupleMembers),
  memories: many(memories),
  timelineEvents: many(timelineEvents),
  sentLetters: many(loveLetters, { relationName: "sentLetters" }),
  receivedLetters: many(loveLetters, { relationName: "receivedLetters" }),
  bucketItems: many(bucketListItems),
  playlists: many(playlists),
  quizQuestions: many(quizQuestions),
  quizSessions: many(quizSessions, { relationName: "quizPlayer" }),
  moods: many(dailyMoods),
  futureItems: many(futureItems),
}));

export const couplesRelations = relations(couples, ({ many }) => ({
  members: many(coupleMembers),
  memories: many(memories),
  timelineEvents: many(timelineEvents),
  loveLetters: many(loveLetters),
  bucketItems: many(bucketListItems),
  playlists: many(playlists),
  quizQuestions: many(quizQuestions),
  quizSessions: many(quizSessions),
  moods: many(dailyMoods),
  futureItems: many(futureItems),
  userAchievements: many(userAchievements),
}));

export const coupleMembersRelations = relations(coupleMembers, ({ one }) => ({
  couple: one(couples, { fields: [coupleMembers.coupleId], references: [couples.id] }),
  profile: one(profiles, { fields: [coupleMembers.userId], references: [profiles.id] }),
}));

export const memoriesRelations = relations(memories, ({ one, many }) => ({
  couple: one(couples, { fields: [memories.coupleId], references: [couples.id] }),
  creator: one(profiles, { fields: [memories.createdBy], references: [profiles.id] }),
  images: many(memoryImages),
}));

export const memoryImagesRelations = relations(memoryImages, ({ one }) => ({
  memory: one(memories, { fields: [memoryImages.memoryId], references: [memories.id] }),
}));

export const timelineEventsRelations = relations(timelineEvents, ({ one }) => ({
  couple: one(couples, { fields: [timelineEvents.coupleId], references: [couples.id] }),
  creator: one(profiles, { fields: [timelineEvents.createdBy], references: [profiles.id] }),
}));

export const loveLettersRelations = relations(loveLetters, ({ one }) => ({
  couple: one(couples, { fields: [loveLetters.coupleId], references: [couples.id] }),
  sender: one(profiles, { fields: [loveLetters.senderId], references: [profiles.id], relationName: "sentLetters" }),
  recipient: one(profiles, { fields: [loveLetters.recipientId], references: [profiles.id], relationName: "receivedLetters" }),
}));

export const bucketListItemsRelations = relations(bucketListItems, ({ one }) => ({
  couple: one(couples, { fields: [bucketListItems.coupleId], references: [couples.id] }),
  creator: one(profiles, { fields: [bucketListItems.createdBy], references: [profiles.id] }),
}));

export const playlistsRelations = relations(playlists, ({ one }) => ({
  couple: one(couples, { fields: [playlists.coupleId], references: [couples.id] }),
  adder: one(profiles, { fields: [playlists.addedBy], references: [profiles.id] }),
}));

export const quizQuestionsRelations = relations(quizQuestions, ({ one }) => ({
  couple: one(couples, { fields: [quizQuestions.coupleId], references: [couples.id] }),
  creator: one(profiles, { fields: [quizQuestions.createdBy], references: [profiles.id] }),
}));

export const quizSessionsRelations = relations(quizSessions, ({ one, many }) => ({
  couple: one(couples, { fields: [quizSessions.coupleId], references: [couples.id] }),
  player: one(profiles, { fields: [quizSessions.playerId], references: [profiles.id], relationName: "quizPlayer" }),
  answers: many(quizAnswers),
}));

export const quizAnswersRelations = relations(quizAnswers, ({ one }) => ({
  session: one(quizSessions, { fields: [quizAnswers.sessionId], references: [quizSessions.id] }),
  question: one(quizQuestions, { fields: [quizAnswers.questionId], references: [quizQuestions.id] }),
}));

export const dailyMoodsRelations = relations(dailyMoods, ({ one }) => ({
  couple: one(couples, { fields: [dailyMoods.coupleId], references: [couples.id] }),
  user: one(profiles, { fields: [dailyMoods.userId], references: [profiles.id] }),
}));

export const futureItemsRelations = relations(futureItems, ({ one }) => ({
  couple: one(couples, { fields: [futureItems.coupleId], references: [couples.id] }),
  creator: one(profiles, { fields: [futureItems.createdBy], references: [profiles.id] }),
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  couple: one(couples, { fields: [userAchievements.coupleId], references: [couples.id] }),
  achievement: one(achievements, { fields: [userAchievements.achievementId], references: [achievements.id] }),
}));