import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./simpleAuth";
import {
  insertGameSchema,
  insertNewsSchema,
  insertChatMessageSchema,
  insertPickemSchema,
  insertPickemRulesSchema,
  insertStandingsSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get("/api/games/all", async (req, res) => {
    try {
      const games = await storage.getAllGames();
      res.json(games);
    } catch (error) {
      console.error("Error fetching all games:", error);
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });

  app.get("/api/games/current", async (req, res) => {
    try {
      const games = await storage.getCurrentWeekGames();
      res.json(games);
    } catch (error) {
      console.error("Error fetching current week games:", error);
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });

  app.get("/api/games/week/:week", async (req, res) => {
    try {
      const week = parseInt(req.params.week);
      const games = await storage.getGamesByWeek(week);
      res.json(games);
    } catch (error) {
      console.error("Error fetching games by week:", error);
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });

  app.get("/api/games/:id", async (req, res) => {
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

  app.post("/api/games", isAuthenticated, async (req, res) => {
    try {
      const gameData = insertGameSchema.parse(req.body);
      const game = await storage.createGame(gameData);
      res.json(game);
    } catch (error) {
      console.error("Error creating game:", error);
      res.status(400).json({ message: "Failed to create game" });
    }
  });

  app.patch("/api/games/:id", isAuthenticated, async (req, res) => {
    try {
      const game = await storage.updateGame(req.params.id, req.body);
      res.json(game);
    } catch (error) {
      console.error("Error updating game:", error);
      res.status(400).json({ message: "Failed to update game" });
    }
  });

  app.delete("/api/games/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteGame(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting game:", error);
      res.status(400).json({ message: "Failed to delete game" });
    }
  });

  app.get("/api/news", async (req, res) => {
    try {
      const news = await storage.getAllNews();
      res.json(news);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });

  app.post("/api/news", isAuthenticated, async (req, res) => {
    try {
      const newsData = insertNewsSchema.parse(req.body);
      const news = await storage.createNews(newsData);
      res.json(news);
    } catch (error) {
      console.error("Error creating news:", error);
      res.status(400).json({ message: "Failed to create news" });
    }
  });

  app.delete("/api/news/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteNews(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting news:", error);
      res.status(400).json({ message: "Failed to delete news" });
    }
  });

  app.get("/api/chat/:gameId?", async (req, res) => {
    try {
      const messages = await storage.getChatMessages(req.params.gameId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.get("/api/pickems", async (req, res) => {
    try {
      const pickems = await storage.getAllPickems();
      res.json(pickems);
    } catch (error) {
      console.error("Error fetching pickems:", error);
      res.status(500).json({ message: "Failed to fetch pickems" });
    }
  });

  app.post("/api/pickems", isAuthenticated, async (req, res) => {
    try {
      const pickemData = insertPickemSchema.parse(req.body);
      const pickem = await storage.createPickem(pickemData);
      res.json(pickem);
    } catch (error) {
      console.error("Error creating pickem:", error);
      res.status(400).json({ message: "Failed to create pickem" });
    }
  });

  app.delete("/api/pickems/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deletePickem(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting pickem:", error);
      res.status(400).json({ message: "Failed to delete pickem" });
    }
  });

  app.get("/api/pickems/rules", async (req, res) => {
    try {
      const rules = await storage.getPickemRules();
      res.json(rules);
    } catch (error) {
      console.error("Error fetching pickem rules:", error);
      res.status(500).json({ message: "Failed to fetch rules" });
    }
  });

  app.post("/api/pickems/rules", isAuthenticated, async (req, res) => {
    try {
      const rulesData = insertPickemRulesSchema.parse(req.body);
      const rules = await storage.upsertPickemRules(rulesData);
      res.json(rules);
    } catch (error) {
      console.error("Error updating pickem rules:", error);
      res.status(400).json({ message: "Failed to update rules" });
    }
  });

  app.get("/api/standings", async (req, res) => {
    try {
      const standings = await storage.getAllStandings();
      res.json(standings);
    } catch (error) {
      console.error("Error fetching standings:", error);
      res.status(500).json({ message: "Failed to fetch standings" });
    }
  });

  app.post("/api/standings", isAuthenticated, async (req, res) => {
    try {
      const standingData = insertStandingsSchema.parse(req.body);
      const standing = await storage.upsertStandings(standingData);
      res.json(standing);
    } catch (error) {
      console.error("Error upserting standing:", error);
      res.status(400).json({ message: "Failed to save standing" });
    }
  });

  app.delete("/api/standings/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteStandings(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting standing:", error);
      res.status(400).json({ message: "Failed to delete standing" });
    }
  });

  const httpServer = createServer(app);

  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection');

    ws.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'chat') {
          const chatMessage = await storage.createChatMessage({
            username: message.username,
            message: message.message,
            gameId: message.gameId || null,
          });

          const broadcastData = JSON.stringify({
            type: 'chat',
            message: chatMessage,
            gameId: message.gameId,
          });

          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(broadcastData);
            }
          });
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  return httpServer;
}
