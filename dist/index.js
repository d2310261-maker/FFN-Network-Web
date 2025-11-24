var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index-prod.ts
import fs from "node:fs";
import path from "node:path";
import express2 from "express";

// server/app.ts
import express from "express";

// server/routes.ts
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  chatMessages: () => chatMessages,
  games: () => games,
  insertChatMessageSchema: () => insertChatMessageSchema,
  insertGameSchema: () => insertGameSchema,
  insertNewsSchema: () => insertNewsSchema,
  insertPickemRulesSchema: () => insertPickemRulesSchema,
  insertPickemSchema: () => insertPickemSchema,
  news: () => news,
  pickemRules: () => pickemRules,
  pickems: () => pickems,
  sessions: () => sessions,
  users: () => users
});
import { sql } from "drizzle-orm";
import {
  pgTable,
  varchar,
  text,
  integer,
  timestamp,
  boolean,
  jsonb,
  index
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var games = pgTable("games", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  week: integer("week").notNull(),
  team1: varchar("team1", { length: 100 }).notNull(),
  team2: varchar("team2", { length: 100 }).notNull(),
  team1Score: integer("team1_score").default(0),
  team2Score: integer("team2_score").default(0),
  quarter: varchar("quarter", { length: 20 }).default("Scheduled"),
  // "Q1", "Q2", "Q3", "Q4", "FINAL", "Scheduled"
  gameTime: timestamp("game_time").defaultNow(),
  location: varchar("location", { length: 200 }),
  isFinal: boolean("is_final").default(false),
  isLive: boolean("is_live").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertGameSchema = createInsertSchema(games).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  gameTime: true
});
var news = pgTable("news", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 300 }).notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  authorId: varchar("author_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertNewsSchema = createInsertSchema(news).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username", { length: 100 }).notNull(),
  message: text("message").notNull(),
  gameId: varchar("game_id"),
  // Optional - for game-specific chats
  createdAt: timestamp("created_at").defaultNow()
});
var insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true
});
var pickems = pgTable("pickems", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  week: integer("week").notNull().unique(),
  pickemUrl: text("pickem_url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertPickemSchema = createInsertSchema(pickems).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var pickemRules = pgTable("pickem_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertPickemRulesSchema = createInsertSchema(pickemRules).omit({
  id: true,
  updatedAt: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, desc } from "drizzle-orm";
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  async getAllGames() {
    return await db.select().from(games).orderBy(games.gameTime);
  }
  async getGamesByWeek(week) {
    return await db.select().from(games).where(eq(games.week, week)).orderBy(games.gameTime);
  }
  async getCurrentWeekGames() {
    const allGames = await db.select().from(games).orderBy(desc(games.week));
    if (allGames.length === 0) return [];
    const currentWeek = allGames[0].week;
    return allGames.filter((g) => g.week === currentWeek);
  }
  async getGame(id) {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game;
  }
  async createGame(gameData) {
    const [game] = await db.insert(games).values(gameData).returning();
    return game;
  }
  async updateGame(id, gameData) {
    const [game] = await db.update(games).set({ ...gameData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(games.id, id)).returning();
    return game;
  }
  async deleteGame(id) {
    await db.delete(games).where(eq(games.id, id));
  }
  async getAllNews() {
    return await db.select().from(news).orderBy(desc(news.createdAt));
  }
  async createNews(newsData) {
    const [newsItem] = await db.insert(news).values(newsData).returning();
    return newsItem;
  }
  async deleteNews(id) {
    await db.delete(news).where(eq(news.id, id));
  }
  async getChatMessages(gameId, limit = 100) {
    if (gameId) {
      return await db.select().from(chatMessages).where(eq(chatMessages.gameId, gameId)).orderBy(chatMessages.createdAt).limit(limit);
    }
    return await db.select().from(chatMessages).orderBy(chatMessages.createdAt).limit(limit);
  }
  async createChatMessage(messageData) {
    const [message] = await db.insert(chatMessages).values(messageData).returning();
    return message;
  }
  async getAllPickems() {
    return await db.select().from(pickems).orderBy(desc(pickems.week));
  }
  async getPickemByWeek(week) {
    const [pickem] = await db.select().from(pickems).where(eq(pickems.week, week));
    return pickem;
  }
  async createPickem(pickemData) {
    const [pickem] = await db.insert(pickems).values(pickemData).returning();
    return pickem;
  }
  async deletePickem(id) {
    await db.delete(pickems).where(eq(pickems.id, id));
  }
  async getPickemRules() {
    const [rules] = await db.select().from(pickemRules).limit(1);
    return rules;
  }
  async upsertPickemRules(rulesData) {
    const existing = await this.getPickemRules();
    if (existing) {
      const [updated] = await db.update(pickemRules).set({ ...rulesData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(pickemRules.id, existing.id)).returning();
      return updated;
    }
    const [created] = await db.insert(pickemRules).values(rulesData).returning();
    return created;
  }
};
var storage = new DatabaseStorage();

// server/simpleAuth.ts
import session from "express-session";
import connectPg from "connect-pg-simple";
var ADMIN_USERNAME = "popfork1";
var ADMIN_PASSWORD = "dairyqueen12";
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions"
  });
  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl
    }
  });
}
async function setupAuth(app2) {
  app2.set("trust proxy", 1);
  app2.use(getSession());
  app2.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      req.session.authenticated = true;
      res.json({ success: true });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  });
  app2.get("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      res.redirect("/");
    });
  });
  app2.get("/api/auth/user", (req, res) => {
    if (req.session.authenticated) {
      res.json({ authenticated: true });
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  });
}
var isAuthenticated = async (req, res, next) => {
  if (req.session.authenticated) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// server/routes.ts
async function registerRoutes(app2) {
  await setupAuth(app2);
  app2.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.get("/api/games/all", async (req, res) => {
    try {
      const games2 = await storage.getAllGames();
      res.json(games2);
    } catch (error) {
      console.error("Error fetching all games:", error);
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });
  app2.get("/api/games/current", async (req, res) => {
    try {
      const games2 = await storage.getCurrentWeekGames();
      res.json(games2);
    } catch (error) {
      console.error("Error fetching current week games:", error);
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });
  app2.get("/api/games/week/:week", async (req, res) => {
    try {
      const week = parseInt(req.params.week);
      const games2 = await storage.getGamesByWeek(week);
      res.json(games2);
    } catch (error) {
      console.error("Error fetching games by week:", error);
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });
  app2.get("/api/games/:id", async (req, res) => {
    try {
      const game = await storage.getGame(req.params.id);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.json(game);
    } catch (error) {
      console.error("Error fetching game:", error);
      res.status(500).json({ message: "Failed to fetch game" });
    }
  });
  app2.post("/api/games", isAuthenticated, async (req, res) => {
    try {
      const gameData = insertGameSchema.parse(req.body);
      const game = await storage.createGame(gameData);
      res.json(game);
    } catch (error) {
      console.error("Error creating game:", error);
      res.status(400).json({ message: "Failed to create game" });
    }
  });
  app2.patch("/api/games/:id", isAuthenticated, async (req, res) => {
    try {
      const game = await storage.updateGame(req.params.id, req.body);
      res.json(game);
    } catch (error) {
      console.error("Error updating game:", error);
      res.status(400).json({ message: "Failed to update game" });
    }
  });
  app2.delete("/api/games/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteGame(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting game:", error);
      res.status(400).json({ message: "Failed to delete game" });
    }
  });
  app2.get("/api/news", async (req, res) => {
    try {
      const news2 = await storage.getAllNews();
      res.json(news2);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });
  app2.post("/api/news", isAuthenticated, async (req, res) => {
    try {
      const newsData = insertNewsSchema.parse(req.body);
      const news2 = await storage.createNews(newsData);
      res.json(news2);
    } catch (error) {
      console.error("Error creating news:", error);
      res.status(400).json({ message: "Failed to create news" });
    }
  });
  app2.delete("/api/news/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteNews(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting news:", error);
      res.status(400).json({ message: "Failed to delete news" });
    }
  });
  app2.get("/api/chat/:gameId?", async (req, res) => {
    try {
      const messages = await storage.getChatMessages(req.params.gameId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  app2.get("/api/pickems", async (req, res) => {
    try {
      const pickems2 = await storage.getAllPickems();
      res.json(pickems2);
    } catch (error) {
      console.error("Error fetching pickems:", error);
      res.status(500).json({ message: "Failed to fetch pickems" });
    }
  });
  app2.post("/api/pickems", isAuthenticated, async (req, res) => {
    try {
      const pickemData = insertPickemSchema.parse(req.body);
      const pickem = await storage.createPickem(pickemData);
      res.json(pickem);
    } catch (error) {
      console.error("Error creating pickem:", error);
      res.status(400).json({ message: "Failed to create pickem" });
    }
  });
  app2.delete("/api/pickems/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deletePickem(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting pickem:", error);
      res.status(400).json({ message: "Failed to delete pickem" });
    }
  });
  app2.get("/api/pickems/rules", async (req, res) => {
    try {
      const rules = await storage.getPickemRules();
      res.json(rules);
    } catch (error) {
      console.error("Error fetching pickem rules:", error);
      res.status(500).json({ message: "Failed to fetch rules" });
    }
  });
  app2.post("/api/pickems/rules", isAuthenticated, async (req, res) => {
    try {
      const rulesData = insertPickemRulesSchema.parse(req.body);
      const rules = await storage.upsertPickemRules(rulesData);
      res.json(rules);
    } catch (error) {
      console.error("Error updating pickem rules:", error);
      res.status(400).json({ message: "Failed to update rules" });
    }
  });
  const httpServer = createServer(app2);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  wss.on("connection", (ws2) => {
    console.log("New WebSocket connection");
    ws2.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === "chat") {
          const chatMessage = await storage.createChatMessage({
            username: message.username,
            message: message.message,
            gameId: message.gameId || null
          });
          const broadcastData = JSON.stringify({
            type: "chat",
            message: chatMessage,
            gameId: message.gameId
          });
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(broadcastData);
            }
          });
        }
      } catch (error) {
        console.error("Error handling WebSocket message:", error);
      }
    });
    ws2.on("close", () => {
      console.log("WebSocket connection closed");
    });
    ws2.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });
  return httpServer;
}

// server/app.ts
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
var app = express();
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path2 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path2.startsWith("/api")) {
      let logLine = `${req.method} ${path2} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
async function runApp(setup) {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  await setup(app, server);
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
}

// server/index-prod.ts
async function serveStatic(app2, _server) {
  const distPath = path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
(async () => {
  await runApp(serveStatic);
})();
export {
  serveStatic
};
