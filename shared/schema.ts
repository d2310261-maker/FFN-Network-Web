import { sql } from "drizzle-orm";
import {
  pgTable,
  varchar,
  text,
  integer,
  timestamp,
  boolean,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth - admin users)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Games table
export const games = pgTable("games", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  week: integer("week").notNull(),
  team1: varchar("team1", { length: 100 }).notNull(),
  team2: varchar("team2", { length: 100 }).notNull(),
  team1Score: integer("team1_score").default(0),
  team2Score: integer("team2_score").default(0),
  quarter: varchar("quarter", { length: 20 }).default("Scheduled"), // "Q1", "Q2", "Q3", "Q4", "FINAL", "Scheduled"
  gameTime: timestamp("game_time"),
  location: varchar("location", { length: 200 }),
  isFinal: boolean("is_final").default(false),
  isLive: boolean("is_live").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  gameTime: z.union([z.string().datetime().transform(s => new Date(s)), z.null(), z.undefined()]).optional(),
});

export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;

// News/Posts table
export const news = pgTable("news", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 300 }).notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  authorId: varchar("author_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertNewsSchema = createInsertSchema(news).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertNews = z.infer<typeof insertNewsSchema>;
export type News = typeof news.$inferSelect;

// Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username", { length: 100 }).notNull(),
  message: text("message").notNull(),
  gameId: varchar("game_id"), // Optional - for game-specific chats
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

// Pick'ems table
export const pickems = pgTable("pickems", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  week: integer("week").notNull().unique(),
  pickemUrl: text("pickem_url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPickemSchema = createInsertSchema(pickems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPickem = z.infer<typeof insertPickemSchema>;
export type Pickem = typeof pickems.$inferSelect;

// Pick'em Rules table (single record for official rules)
export const pickemRules = pgTable("pickem_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPickemRulesSchema = createInsertSchema(pickemRules).omit({
  id: true,
  updatedAt: true,
});

export type InsertPickemRules = z.infer<typeof insertPickemRulesSchema>;
export type PickemRules = typeof pickemRules.$inferSelect;

// Standings table
export const standings = pgTable("standings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  team: varchar("team", { length: 100 }).notNull(),
  division: varchar("division", { length: 10 }).notNull(),
  wins: integer("wins").default(0),
  losses: integer("losses").default(0),
  ties: integer("ties").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertStandingsSchema = createInsertSchema(standings).omit({
  id: true,
  updatedAt: true,
});

export type InsertStandings = z.infer<typeof insertStandingsSchema>;
export type Standings = typeof standings.$inferSelect;

// Playoff bracket table
export const playoffMatches = pgTable("playoff_matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  round: varchar("round", { length: 50 }).notNull(), // "play_in", "wildcard", "divisional", "conference", "super_bowl"
  matchNumber: integer("match_number").notNull(), // 1-8 for play-in, 1-4 for wildcard, etc.
  seed1: integer("seed1"), // seed number (1-12)
  seed2: integer("seed2"),
  team1: varchar("team1", { length: 100 }), // team name
  team2: varchar("team2", { length: 100 }),
  team1Score: integer("team1_score"),
  team2Score: integer("team2_score"),
  winner: varchar("winner", { length: 100 }), // winning team name
  isComplete: boolean("is_complete").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPlayoffMatchSchema = createInsertSchema(playoffMatches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPlayoffMatch = z.infer<typeof insertPlayoffMatchSchema>;
export type PlayoffMatch = typeof playoffMatches.$inferSelect;
