import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BracketTeam {
  id: string;
  name: string;
}

interface BracketMatch {
  id: string;
  team1?: BracketTeam;
  team2?: BracketTeam;
  winner?: string;
  round: number;
}

const AVAILABLE_TEAMS = [
  "Atlanta Falcons",
  "Tampa Bay Buccaneers",
  "Jacksonville Jaguars",
  "Los Angeles Rams",
  "Baltimore Ravens",
  "Miami Dolphins",
  "Chicago Bears",
  "Houston Texans",
  "New Orleans Saints",
  "San Francisco 49ers",
  "Kansas City Chiefs",
  "Detroit Lions",
  "Philadelphia Eagles",
  "Arizona Cardinals",
  "Dallas Cowboys",
  "Buffalo Bills",
];

export default function Playoffs() {
  const { isAuthenticated } = useAuth();
  const [bracket, setBracket] = useState<BracketMatch[]>([
    { id: "wc1", round: 1, team1: undefined, team2: undefined },
    { id: "wc2", round: 1, team1: undefined, team2: undefined },
    { id: "wc3", round: 1, team1: undefined, team2: undefined },
    { id: "wc4", round: 1, team1: undefined, team2: undefined },
    { id: "div1", round: 2, team1: undefined, team2: undefined },
    { id: "div2", round: 2, team1: undefined, team2: undefined },
    { id: "final", round: 3, team1: undefined, team2: undefined },
  ]);

  const updateMatch = (matchId: string, field: string, value: any) => {
    if (!isAuthenticated) return;
    setBracket(
      bracket.map((match) =>
        match.id === matchId ? { ...match, [field]: value } : match
      )
    );
  };

  const getMatchesForRound = (round: number) => {
    return bracket.filter((m) => m.round === round);
  };

  const roundNames: Record<number, string> = {
    1: "Wildcard",
    2: "Divisional",
    3: "Championship",
  };

  const usedTeams = bracket
    .flatMap((m) => [m.team1?.name, m.team2?.name])
    .filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black mb-4" data-testid="text-page-title">
            Playoff Bracket
          </h1>
          <p className="text-muted-foreground text-lg">
            BFFL Season 1 - 12 Team Playoff
          </p>
        </div>

        {isAuthenticated ? (
          <div className="space-y-8">
            {[1, 2, 3].map((round) => (
              <Card key={round} className="p-6">
                <h2 className="text-2xl font-bold mb-6">{roundNames[round]}</h2>
                <div className="space-y-4">
                  {getMatchesForRound(round).map((match) => (
                    <div
                      key={match.id}
                      className="border rounded-lg p-4 bg-muted/30 space-y-3"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2].map((teamNum) => {
                          const teamKey = (teamNum === 1 ? "team1" : "team2") as "team1" | "team2";
                          const team = match[teamKey];

                          return (
                            <div key={teamNum}>
                              <Label>Team {teamNum}</Label>
                              <Input
                                list={`teams-${match.id}-${teamNum}`}
                                value={team?.name || ""}
                                onChange={(e) => {
                                  const newTeam = e.target.value
                                    ? { id: `${match.id}-t${teamNum}`, name: e.target.value }
                                    : undefined;
                                  updateMatch(match.id, teamKey, newTeam);
                                }}
                                placeholder="Enter team name"
                              />
                              <datalist id={`teams-${match.id}-${teamNum}`}>
                                {AVAILABLE_TEAMS.filter((t) => !usedTeams.includes(t) || team?.name === t).map(
                                  (team) => (
                                    <option key={team} value={team} />
                                  )
                                )}
                              </datalist>
                            </div>
                          );
                        })}
                      </div>
                      {match.team1 && match.team2 && (
                        <div className="pt-3 border-t">
                          <Label className="mb-2 block">Winner</Label>
                          <div className="flex gap-2">
                            <Button
                              variant={match.winner === match.team1.id ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateMatch(match.id, "winner", match.team1?.id)}
                              className="flex-1"
                            >
                              {match.team1.name}
                            </Button>
                            <Button
                              variant={match.winner === match.team2?.id ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateMatch(match.id, "winner", match.team2?.id)}
                              className="flex-1"
                            >
                              {match.team2.name}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 overflow-x-auto">
            <div className="min-w-max flex gap-8 justify-center">
              {[1, 2, 3].map((round) => {
                const matches = getMatchesForRound(round);
                return (
                  <div key={round} className="flex flex-col justify-center gap-4">
                    <h3 className="text-center font-semibold text-sm mb-4">
                      {roundNames[round]}
                    </h3>
                    <div className="flex flex-col gap-8 justify-center">
                      {matches.map((match, idx) => {
                        const spacing = Math.pow(2, round - 1);
                        return (
                          <div
                            key={match.id}
                            style={{
                              marginTop: idx === 0 ? 0 : `${(spacing - 1) * 2}rem`,
                            }}
                          >
                            <div className="bg-muted rounded border border-border min-w-[200px]">
                              <div className="divide-y">
                                <div className="p-3 text-sm font-medium">
                                  {match.team1?.name || "TBD"}
                                  {match.winner === match.team1?.id && (
                                    <span className="ml-2 text-xs font-bold text-primary">✓</span>
                                  )}
                                </div>
                                <div className="p-3 text-sm font-medium">
                                  {match.team2?.name || "TBD"}
                                  {match.winner === match.team2?.id && (
                                    <span className="ml-2 text-xs font-bold text-primary">✓</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
