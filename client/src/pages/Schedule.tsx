import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Game } from "@shared/schema";
import { format, isFuture, isPast } from "date-fns";
import { Calendar, MapPin, AlertCircle } from "lucide-react";

export default function Schedule() {
  const { data: allGames, isLoading, error } = useQuery<Game[]>({
    queryKey: ["/api/games/all"],
  });

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center gap-3 text-destructive">
          <AlertCircle className="w-5 h-5" />
          <p>Failed to load schedule</p>
        </div>
      </div>
    );
  }

  const gamesByWeek = allGames?.reduce((acc, game) => {
    if (game.week <= 10 && !acc[game.week]) {
      acc[game.week] = [];
    }
    if (game.week <= 10) {
      acc[game.week].push(game);
    }
    return acc;
  }, {} as Record<number, Game[]>) || {};

  const weeks = Object.keys(gamesByWeek).map(Number).sort((a, b) => a - b);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-black mb-4" data-testid="text-page-title">
          Full Schedule
        </h1>
        <p className="text-muted-foreground text-lg">
          Complete season schedule with dates, times, and locations
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-8">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <Skeleton className="h-8 w-32 mb-4" />
              <div className="space-y-3">
                {[...Array(4)].map((_, j) => (
                  <Skeleton key={j} className="h-24" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : weeks.length > 0 ? (
        <div className="space-y-8">
          {weeks.map((week) => (
            <div key={week}>
              <h2 className="text-2xl font-bold mb-4" data-testid={`text-week-${week}`}>
                Week {week}
              </h2>
              <div className="space-y-3">
                {gamesByWeek[week].map((game) => {
                  const gameDate = game.gameTime ? new Date(game.gameTime) : null;
                  const isUpcoming = gameDate ? isFuture(gameDate) : false;
                  const isCompleted = gameDate ? (isPast(gameDate) || game.isFinal) : game.isFinal;

                  return (
                    <Card key={game.id} className="p-4 hover-elevate" data-testid={`card-game-${game.id}`}>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge
                              variant={game.isLive ? "default" : game.isFinal ? "secondary" : "outline"}
                              data-testid={`badge-status-${game.id}`}
                            >
                              {game.isLive ? "LIVE" : game.isFinal ? "FINAL" : isUpcoming ? "Upcoming" : game.quarter}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <p className="font-semibold text-lg" data-testid={`text-matchup-${game.id}`}>
                              {game.team2} vs {game.team1}
                            </p>
                            {game.isFinal && (
                              <p className="text-muted-foreground" data-testid={`text-score-${game.id}`}>
                                Final: {game.team2} {game.team2Score} - {game.team1Score} {game.team1}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 md:text-right">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span data-testid={`text-datetime-${game.id}`}>
                              {gameDate ? format(gameDate, "EEE, MMM d 'at' h:mm a") : "Time TBD"}
                            </span>
                          </div>
                          {game.location && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              <span data-testid={`text-location-${game.id}`}>{game.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">
            No games scheduled yet
          </p>
        </div>
      )}
    </div>
  );
}
