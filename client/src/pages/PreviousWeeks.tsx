import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/GameCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { Game } from "@shared/schema";
import { useLocation } from "wouter";
import { AlertCircle } from "lucide-react";

export default function PreviousWeeks() {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [, setLocation] = useLocation();

  const { data: games, isLoading, error } = useQuery<Game[]>({
    queryKey: ["/api/games/week", selectedWeek],
  });

  const weeks = Array.from({ length: 10 }, (_, i) => i + 1);

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center gap-3 text-destructive">
          <AlertCircle className="w-5 h-5" />
          <p>Failed to load games</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-black mb-4" data-testid="text-page-title">
          Previous Weeks
        </h1>
        <p className="text-muted-foreground text-lg mb-6">
          Browse final scores from all weeks of the season
        </p>

        <div className="flex flex-wrap gap-2">
          {weeks.map((week) => (
            <Button
              key={week}
              variant={selectedWeek === week ? "default" : "outline"}
              onClick={() => setSelectedWeek(week)}
              data-testid={`button-week-${week}`}
            >
              Week {week}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : games && games.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onClick={() => setLocation(`/game/${game.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">
            No games found for Week {selectedWeek}
          </p>
        </div>
      )}
    </div>
  );
}
