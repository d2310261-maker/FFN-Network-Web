import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Game } from "@shared/schema";
import { format } from "date-fns";

interface GameCardProps {
  game: Game;
  onClick?: () => void;
}

export function GameCard({ game, onClick }: GameCardProps) {
  return (
    <Card
      className={`p-6 cursor-pointer hover-elevate active-elevate-2 ${game.isLive ? 'border-primary' : ''}`}
      onClick={onClick}
      data-testid={`card-game-${game.id}`}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Badge
            variant={game.isLive ? "default" : game.isFinal ? "secondary" : "outline"}
            className={game.isLive ? "animate-pulse" : ""}
            data-testid={`badge-status-${game.id}`}
          >
            {game.isLive ? "LIVE" : game.isFinal ? "FINAL" : game.quarter}
          </Badge>
          <span className="text-xs text-muted-foreground" data-testid={`text-gametime-${game.id}`}>
            {game.gameTime ? format(new Date(game.gameTime), "EEE, MMM d 'at' h:mm a") : "Time TBD"}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={`text-lg font-bold ${game.team2Score! > game.team1Score! && game.isFinal ? 'text-primary' : ''}`} data-testid={`text-team2-${game.id}`}>
              {game.team2}
            </span>
            <span className={`text-5xl font-black tabular-nums ${game.team2Score! > game.team1Score! && game.isFinal ? 'text-primary' : ''}`} data-testid={`text-team2-score-${game.id}`}>
              {game.team2Score}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className={`text-lg font-bold ${game.team1Score! > game.team2Score! && game.isFinal ? 'text-primary' : ''}`} data-testid={`text-team1-${game.id}`}>
              {game.team1}
            </span>
            <span className={`text-5xl font-black tabular-nums ${game.team1Score! > game.team2Score! && game.isFinal ? 'text-primary' : ''}`} data-testid={`text-team1-score-${game.id}`}>
              {game.team1Score}
            </span>
          </div>
        </div>

        {game.location && (
          <div className="text-sm text-muted-foreground" data-testid={`text-location-${game.id}`}>
            {game.location}
          </div>
        )}
      </div>
    </Card>
  );
}
