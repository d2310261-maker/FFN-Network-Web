import {
  users,
  games,
  news,
  chatMessages,
  pickems,
  pickemRules,
  standings,
  playoffMatches,
  type User,
  type UpsertUser,
  type Game,
  type InsertGame,
  type News,
  type InsertNews,
  type ChatMessage,
  type InsertChatMessage,
  type Pickem,
  type InsertPickem,
  type PickemRules,
  type InsertPickemRules,
  type Standings,
  type InsertStandings,
  type PlayoffMatch,
  type InsertPlayoffMatch,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  getAllGames(): Promise<Game[]>;
  getGamesByWeek(week: number): Promise<Game[]>;
  getCurrentWeekGames(): Promise<Game[]>;
  getGame(id: string): Promise<Game | undefined>;
  createGame(game: InsertGame): Promise<Game>;
  updateGame(id: string, game: Partial<Game>): Promise<Game>;
  deleteGame(id: string): Promise<void>;
  
  getAllNews(): Promise<News[]>;
  createNews(news: InsertNews): Promise<News>;
  deleteNews(id: string): Promise<void>;
  
  getChatMessages(gameId?: string, limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  getAllPickems(): Promise<Pickem[]>;
  getPickemByWeek(week: number): Promise<Pickem | undefined>;
  createPickem(pickem: InsertPickem): Promise<Pickem>;
  deletePickem(id: string): Promise<void>;
  
  getPickemRules(): Promise<PickemRules | undefined>;
  upsertPickemRules(rules: InsertPickemRules): Promise<PickemRules>;
  
  getAllStandings(): Promise<Standings[]>;
  upsertStandings(standing: InsertStandings): Promise<Standings>;
  deleteStandings(id: string): Promise<void>;
  
  getAllPlayoffMatches(): Promise<PlayoffMatch[]>;
  getPlayoffMatchesByRound(round: string): Promise<PlayoffMatch[]>;
  createPlayoffMatch(match: InsertPlayoffMatch): Promise<PlayoffMatch>;
  updatePlayoffMatch(id: string, match: Partial<PlayoffMatch>): Promise<PlayoffMatch>;
  deletePlayoffMatch(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getAllGames(): Promise<Game[]> {
    return await db.select().from(games).orderBy(games.gameTime);
  }

  async getGamesByWeek(week: number): Promise<Game[]> {
    return await db
      .select()
      .from(games)
      .where(eq(games.week, week))
      .orderBy(games.gameTime);
  }

  async getCurrentWeekGames(): Promise<Game[]> {
    const allGames = await db.select().from(games).orderBy(desc(games.week));
    if (allGames.length === 0) return [];
    
    const currentWeek = allGames[0].week;
    return allGames.filter(g => g.week === currentWeek);
  }

  async getGame(id: string): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game;
  }

  async createGame(gameData: InsertGame): Promise<Game> {
    const [game] = await db.insert(games).values(gameData).returning();
    return game;
  }

  async updateGame(id: string, gameData: Partial<Game>): Promise<Game> {
    const updateData: any = { ...gameData };
    if (updateData.gameTime && typeof updateData.gameTime === 'string') {
      updateData.gameTime = new Date(updateData.gameTime);
    }
    const [game] = await db
      .update(games)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(games.id, id))
      .returning();
    return game;
  }

  async deleteGame(id: string): Promise<void> {
    await db.delete(games).where(eq(games.id, id));
  }

  async getAllNews(): Promise<News[]> {
    return await db.select().from(news).orderBy(desc(news.createdAt));
  }

  async createNews(newsData: InsertNews): Promise<News> {
    const [newsItem] = await db.insert(news).values(newsData).returning();
    return newsItem;
  }

  async deleteNews(id: string): Promise<void> {
    await db.delete(news).where(eq(news.id, id));
  }

  async getChatMessages(gameId?: string, limit: number = 100): Promise<ChatMessage[]> {
    if (gameId) {
      return await db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.gameId, gameId))
        .orderBy(chatMessages.createdAt)
        .limit(limit);
    }
    return await db
      .select()
      .from(chatMessages)
      .orderBy(chatMessages.createdAt)
      .limit(limit);
  }

  async createChatMessage(messageData: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db.insert(chatMessages).values(messageData).returning();
    return message;
  }

  async getAllPickems(): Promise<Pickem[]> {
    return await db.select().from(pickems).orderBy(desc(pickems.week));
  }

  async getPickemByWeek(week: number): Promise<Pickem | undefined> {
    const [pickem] = await db.select().from(pickems).where(eq(pickems.week, week));
    return pickem;
  }

  async createPickem(pickemData: InsertPickem): Promise<Pickem> {
    const [pickem] = await db.insert(pickems).values(pickemData).returning();
    return pickem;
  }

  async deletePickem(id: string): Promise<void> {
    await db.delete(pickems).where(eq(pickems.id, id));
  }

  async getPickemRules(): Promise<PickemRules | undefined> {
    const [rules] = await db.select().from(pickemRules).limit(1);
    return rules;
  }

  async upsertPickemRules(rulesData: InsertPickemRules): Promise<PickemRules> {
    const existing = await this.getPickemRules();
    
    if (existing) {
      const [updated] = await db
        .update(pickemRules)
        .set({ ...rulesData, updatedAt: new Date() })
        .where(eq(pickemRules.id, existing.id))
        .returning();
      return updated;
    }
    
    const [created] = await db.insert(pickemRules).values(rulesData).returning();
    return created;
  }

  async getAllStandings(): Promise<Standings[]> {
    return await db.select().from(standings).orderBy(standings.division);
  }

  async upsertStandings(standingData: InsertStandings): Promise<Standings> {
    const existing = await db
      .select()
      .from(standings)
      .where(and(eq(standings.team, standingData.team), eq(standings.division, standingData.division)));
    
    if (existing.length > 0) {
      const [updated] = await db
        .update(standings)
        .set({ ...standingData, updatedAt: new Date() })
        .where(eq(standings.id, existing[0].id))
        .returning();
      return updated;
    }

    const [created] = await db.insert(standings).values(standingData).returning();
    return created;
  }

  async deleteStandings(id: string): Promise<void> {
    await db.delete(standings).where(eq(standings.id, id));
  }

  async getAllPlayoffMatches(): Promise<PlayoffMatch[]> {
    return await db.select().from(playoffMatches).orderBy(playoffMatches.round, playoffMatches.matchNumber);
  }

  async getPlayoffMatchesByRound(round: string): Promise<PlayoffMatch[]> {
    return await db.select().from(playoffMatches).where(eq(playoffMatches.round, round)).orderBy(playoffMatches.matchNumber);
  }

  async createPlayoffMatch(matchData: InsertPlayoffMatch): Promise<PlayoffMatch> {
    const [match] = await db.insert(playoffMatches).values(matchData).returning();
    return match;
  }

  async updatePlayoffMatch(id: string, matchData: Partial<PlayoffMatch>): Promise<PlayoffMatch> {
    const [match] = await db
      .update(playoffMatches)
      .set({ ...matchData, updatedAt: new Date() })
      .where(eq(playoffMatches.id, id))
      .returning();
    return match;
  }

  async deletePlayoffMatch(id: string): Promise<void> {
    await db.delete(playoffMatches).where(eq(playoffMatches.id, id));
  }
}

export const storage = new DatabaseStorage();
