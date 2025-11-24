import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChatComponent } from "@/components/ChatComponent";
import { Skeleton } from "@/components/ui/skeleton";
import type { Game, ChatMessage } from "@shared/schema";
import { format } from "date-fns";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect, useRef } from "react";

export default function GameDetail() {
  const [, params] = useRoute("/game/:id");
  const gameId = params?.id;
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const { data: game, isLoading: gameLoading, error: gameError } = useQuery<Game>({
    queryKey: ["/api/games", gameId],
    enabled: !!gameId,
    refetchInterval: 15000,
  });

  const { data: initialMessages } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat", gameId],
    enabled: !!gameId,
  });

  useEffect(() => {
    if (initialMessages) {
      setChatMessages(initialMessages);
    }
  }, [initialMessages]);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const hostname = window.location.hostname || "localhost";
    const port = window.location.port ? `:${window.location.port}` : ":5000";
    const wsUrl = `${protocol}//${hostname}${port}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "chat" && (!gameId || data.gameId === gameId)) {
          setChatMessages((prev) => [...prev, data.message]);
        }
      } catch (err) {
        console.error("Failed to parse WebSocket message:", err);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    wsRef.current = socket;

    return () => {
      socket.close();
    };
  }, [gameId]);

  const handleSendMessage = (username: string, message: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "chat",
          username,
          message,
          gameId,
        })
      );
    }
  };

  if (gameError) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center gap-3 text-destructive">
          <AlertCircle className="w-5 h-5" />
          <p>Failed to load game details</p>
        </div>
      </div>
    );
  }

  if (gameLoading || !game) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Skeleton className="h-96 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[600px] lg:col-span-2" />
          <Skeleton className="h-[600px]" />
        </div>
      </div>
    );
  }

  const isScheduled = game.quarter === "Scheduled";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/scores">
        <Button variant="ghost" className="mb-6 gap-2" data-testid="button-back">
          <ArrowLeft className="w-4 h-4" />
          Back to Scores
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Badge
                variant={game.isLive ? "default" : game.isFinal ? "secondary" : "outline"}
                className={`text-lg px-4 py-2 ${game.isLive ? 'animate-pulse' : ''}`}
                data-testid="badge-game-status"
              >
                {game.isLive ? "LIVE" : game.isFinal ? "FINAL" : game.quarter}
              </Badge>
              <span className="text-sm text-muted-foreground" data-testid="text-game-time">
                {game.gameTime ? format(new Date(game.gameTime), "EEEE, MMMM d 'at' h:mm a") : "Time TBD"}
              </span>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between py-4 border-b">
                <div className="flex-1">
                  <h2 className={`text-2xl md:text-3xl font-bold ${game.team2Score! > game.team1Score! && game.isFinal ? 'text-primary' : ''}`} data-testid="text-team2">
                    {game.team2}
                  </h2>
                </div>
                <div className={`text-6xl md:text-7xl font-black tabular-nums ${game.team2Score! > game.team1Score! && game.isFinal ? 'text-primary' : ''}`} data-testid="text-team2-score">
                  {game.team2Score}
                </div>
              </div>

              <div className="flex items-center justify-between py-4">
                <div className="flex-1">
                  <h2 className={`text-2xl md:text-3xl font-bold ${game.team1Score! > game.team2Score! && game.isFinal ? 'text-primary' : ''}`} data-testid="text-team1">
                    {game.team1}
                  </h2>
                </div>
                <div className={`text-6xl md:text-7xl font-black tabular-nums ${game.team1Score! > game.team2Score! && game.isFinal ? 'text-primary' : ''}`} data-testid="text-team1-score">
                  {game.team1Score}
                </div>
              </div>
            </div>

            {game.location && (
              <div className="pt-4 border-t">
                <p className="text-muted-foreground" data-testid="text-game-location">
                  <span className="font-semibold">Location:</span> {game.location}
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card className="h-[600px] flex flex-col overflow-hidden">
          <ChatComponent
            gameId={gameId}
            messages={chatMessages}
            onSendMessage={handleSendMessage}
          />
        </Card>
      </div>
    </div>
  );
}
