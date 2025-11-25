import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Game, News as NewsType, Pickem, PickemRules } from "@shared/schema";
import { format } from "date-fns";
import { Plus, Trash2, Edit, Save } from "lucide-react";

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

export default function AdminDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Redirecting to login...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl md:text-5xl font-black mb-8" data-testid="text-page-title">
        Admin Dashboard
      </h1>

      <Tabs defaultValue="games" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
          <TabsTrigger value="games" data-testid="tab-games">Games</TabsTrigger>
          <TabsTrigger value="scores" data-testid="tab-scores">Scores</TabsTrigger>
          <TabsTrigger value="news" data-testid="tab-news">News</TabsTrigger>
          <TabsTrigger value="pickems" data-testid="tab-pickems">Pick'ems</TabsTrigger>
          <TabsTrigger value="rules" data-testid="tab-rules">Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="games">
          <GamesManager />
        </TabsContent>

        <TabsContent value="scores">
          <ScoresManager />
        </TabsContent>

        <TabsContent value="news">
          <NewsManager />
        </TabsContent>

        <TabsContent value="pickems">
          <PickemsManager />
        </TabsContent>

        <TabsContent value="rules">
          <RulesManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function GamesManager() {
  const { toast } = useToast();
  const [week, setWeek] = useState(1);
  const [gamesList, setGamesList] = useState<Array<{ team1: string; team2: string; date: string; time: string }>>([
    { team1: "", team2: "", date: "", time: "" },
  ]);
  const [editingGameId, setEditingGameId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");

  const { data: games } = useQuery<Game[]>({
    queryKey: ["/api/games/all"],
  });

  const createMutation = useMutation({
    mutationFn: async (games: Array<{ week: number; team1: string; team2: string; date: string; time: string }>) => {
      await Promise.all(games.map((game) => {
        const payload: any = {
          week: game.week,
          team1: game.team1,
          team2: game.team2,
          gameTime: null,
        };
        if (game.date && game.time) {
          const gameTime = new Date(`${game.date}T${game.time}`);
          payload.gameTime = gameTime.toISOString();
        }
        return apiRequest("POST", "/api/games", payload);
      }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => {
        const key = query.queryKey;
        return typeof key[0] === 'string' && key[0]?.startsWith('/api/games');
      }});
      toast({ title: "Success", description: "Week scheduled successfully" });
      setGamesList([{ team1: "", team2: "", date: "", time: "" }]);
      setWeek(1);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({ title: "Error", description: "Failed to schedule week", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/games/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => {
        const key = query.queryKey;
        return typeof key[0] === 'string' && key[0]?.startsWith('/api/games');
      }});
      toast({ title: "Success", description: "Game deleted successfully" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({ title: "Error", description: "Failed to delete game", variant: "destructive" });
    },
  });

  const updateTimeMutation = useMutation({
    mutationFn: async ({ id, date, time }: { id: string; date: string; time: string }) => {
      if (date && time) {
        const gameTime = new Date(`${date}T${time}`);
        await apiRequest("PATCH", `/api/games/${id}`, { gameTime: gameTime.toISOString() });
      } else {
        await apiRequest("PATCH", `/api/games/${id}`, { gameTime: null });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => {
        const key = query.queryKey;
        return typeof key[0] === 'string' && key[0]?.startsWith('/api/games');
      }});
      toast({ title: "Success", description: "Game time updated successfully" });
      setEditingGameId(null);
      setEditDate("");
      setEditTime("");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({ title: "Error", description: "Failed to update game time", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validGames = gamesList.filter((g) => g.team1.trim() && g.team2.trim()).map((g) => {
      // If date or time is empty, clear both to ensure gameTime stays null
      if (!g.date || !g.time) {
        return { ...g, date: "", time: "" };
      }
      return g;
    });
    if (validGames.length === 0) {
      toast({ title: "Error", description: "Add at least one game with teams", variant: "destructive" });
      return;
    }
    createMutation.mutate(validGames.map((g) => ({ week, ...g })));
  };

  const handleGameChange = (index: number, field: "team1" | "team2" | "date" | "time", value: string) => {
    const updated = [...gamesList];
    updated[index] = { ...updated[index], [field]: value };
    setGamesList(updated);
  };

  const addGameRow = () => {
    setGamesList([...gamesList, { team1: "", team2: "", date: "", time: "" }]);
  };

  const removeGameRow = (index: number) => {
    setGamesList(gamesList.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Schedule Week</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="week">Week</Label>
            <Input
              id="week"
              type="number"
              min="1"
              max="18"
              value={week}
              onChange={(e) => setWeek(parseInt(e.target.value))}
              required
              data-testid="input-week"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Games</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addGameRow}
                className="gap-2"
                data-testid="button-add-game-row"
              >
                <Plus className="w-4 h-4" />
                Add Game
              </Button>
            </div>

            {gamesList.map((game, index) => {
              const usedTeams = gamesList.map(g => g.team1).concat(gamesList.map(g => g.team2)).filter(t => t && (t !== game.team1 || t === game.team1) && (t !== game.team2 || t === game.team2));
              const availableTeams = AVAILABLE_TEAMS.filter(t => !usedTeams.includes(t) || t === game.team1 || t === game.team2);
              return (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 border rounded-md bg-muted/30" data-testid={`game-row-${index}`}>
                <div>
                  <Label htmlFor={`team2-${index}`}>Team 2</Label>
                  <Select value={game.team2} onValueChange={(value) => handleGameChange(index, "team2", value)}>
                    <SelectTrigger id={`team2-${index}`} data-testid={`select-team2-${index}`}>
                      <SelectValue placeholder="Select Team 2" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTeams.map((team) => (
                        <SelectItem key={team} value={team}>
                          {team}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`team1-${index}`}>Team 1</Label>
                  <Select value={game.team1} onValueChange={(value) => handleGameChange(index, "team1", value)}>
                    <SelectTrigger id={`team1-${index}`} data-testid={`select-team1-${index}`}>
                      <SelectValue placeholder="Select Team 1" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTeams.map((team) => (
                        <SelectItem key={team} value={team}>
                          {team}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`date-${index}`}>Date</Label>
                  <Input
                    id={`date-${index}`}
                    type="date"
                    value={game.date}
                    onChange={(e) => handleGameChange(index, "date", e.target.value)}
                    data-testid={`input-date-${index}`}
                  />
                </div>
                <div>
                  <Label htmlFor={`time-${index}`}>Time</Label>
                  <Input
                    id={`time-${index}`}
                    type="time"
                    value={game.time}
                    onChange={(e) => handleGameChange(index, "time", e.target.value)}
                    data-testid={`input-time-${index}`}
                  />
                </div>
                {gamesList.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeGameRow(index)}
                    className="md:col-span-4 justify-self-end"
                    data-testid={`button-remove-game-${index}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            );
            })}
          </div>

          <Button type="submit" className="gap-2 w-full" disabled={createMutation.isPending} data-testid="button-schedule-week">
            <Plus className="w-4 h-4" />
            {createMutation.isPending ? "Scheduling..." : `Schedule Week ${week}`}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">All Games</h2>
        <div className="space-y-3">
          {games?.map((game) => (
            <div key={game.id} data-testid={`game-item-${game.id}`}>
              {editingGameId === game.id ? (
                <div className="p-4 border rounded-md bg-muted/30 space-y-3">
                  <p className="font-semibold">{game.team2} vs {game.team1}</p>
                  <p className="text-sm text-muted-foreground">
                    {editDate && editTime ? `${editDate} at ${editTime}` : "Time TBD"}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor={`edit-date-${game.id}`}>Date</Label>
                      <Input
                        id={`edit-date-${game.id}`}
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        data-testid={`input-edit-date-${game.id}`}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`edit-time-${game.id}`}>Time</Label>
                      <Input
                        id={`edit-time-${game.id}`}
                        type="time"
                        value={editTime}
                        onChange={(e) => setEditTime(e.target.value)}
                        data-testid={`input-edit-time-${game.id}`}
                      />
                    </div>
                    <div className="flex gap-2 items-end">
                      <Button
                        size="sm"
                        onClick={() => updateTimeMutation.mutate({ id: game.id, date: editDate, time: editTime })}
                        disabled={updateTimeMutation.isPending || !editDate || !editTime}
                        data-testid={`button-save-time-${game.id}`}
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateTimeMutation.mutate({ id: game.id, date: "", time: "" })}
                        disabled={updateTimeMutation.isPending}
                        data-testid={`button-clear-time-${game.id}`}
                      >
                        Clear
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingGameId(null);
                          setEditDate("");
                          setEditTime("");
                        }}
                        data-testid={`button-cancel-edit-${game.id}`}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 border rounded-md">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge>Week {game.week}</Badge>
                      {game.isLive && <Badge variant="default">LIVE</Badge>}
                      {game.isFinal && <Badge variant="secondary">FINAL</Badge>}
                    </div>
                    <p className="font-semibold">{game.team2} vs {game.team1}</p>
                    <p className="text-sm text-muted-foreground">
                      {game.gameTime ? format(new Date(game.gameTime), "MMM d, yyyy 'at' h:mm a") : "Time TBD"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setEditingGameId(game.id);
                        setEditDate("");
                        setEditTime("");
                      }}
                      data-testid={`button-edit-time-${game.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteMutation.mutate(game.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-${game.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ScoresManager() {
  const { toast } = useToast();
  const { data: games } = useQuery<Game[]>({
    queryKey: ["/api/games/all"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Game> }) => {
      await apiRequest("PATCH", `/api/games/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => {
        const key = query.queryKey;
        return typeof key[0] === 'string' && key[0]?.startsWith('/api/games');
      }});
      toast({ title: "Success", description: "Score updated successfully" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({ title: "Error", description: "Failed to update score", variant: "destructive" });
    },
  });

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Update Scores</h2>
        <div className="space-y-4">
          {games?.map((game) => (
            <Card key={game.id} className="p-4" data-testid={`score-card-${game.id}`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{game.team2} vs {game.team1}</p>
                    <p className="text-sm text-muted-foreground">Week {game.week}</p>
                  </div>
                  <Badge>{game.quarter}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor={`team2-${game.id}`}>Team 2 Score</Label>
                    <Input
                      id={`team2-${game.id}`}
                      type="number"
                      min="0"
                      defaultValue={game.team2Score || 0}
                      onBlur={(e) => {
                        const newScore = parseInt(e.target.value) || 0;
                        if (newScore !== game.team2Score) {
                          updateMutation.mutate({ id: game.id, data: { team2Score: newScore } });
                        }
                      }}
                      data-testid={`input-team2-score-${game.id}`}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`team1-${game.id}`}>Team 1 Score</Label>
                    <Input
                      id={`team1-${game.id}`}
                      type="number"
                      min="0"
                      defaultValue={game.team1Score || 0}
                      onBlur={(e) => {
                        const newScore = parseInt(e.target.value) || 0;
                        if (newScore !== game.team1Score) {
                          updateMutation.mutate({ id: game.id, data: { team1Score: newScore } });
                        }
                      }}
                      data-testid={`input-team1-score-${game.id}`}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`quarter-${game.id}`}>Quarter/Status</Label>
                    <Input
                      id={`quarter-${game.id}`}
                      defaultValue={game.quarter || "Scheduled"}
                      onBlur={(e) => {
                        if (e.target.value !== game.quarter) {
                          updateMutation.mutate({ id: game.id, data: { quarter: e.target.value } });
                        }
                      }}
                      data-testid={`input-quarter-${game.id}`}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={game.isLive || false}
                        onCheckedChange={(checked) => {
                          updateMutation.mutate({ id: game.id, data: { isLive: checked } });
                        }}
                        data-testid={`switch-live-${game.id}`}
                      />
                      <Label>Live</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={game.isFinal || false}
                        onCheckedChange={(checked) => {
                          updateMutation.mutate({ id: game.id, data: { isFinal: checked } });
                        }}
                        data-testid={`switch-final-${game.id}`}
                      />
                      <Label>Final</Label>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}

function NewsManager() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
  });

  const { data: news } = useQuery<NewsType[]>({
    queryKey: ["/api/news"],
  });

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData & { authorId: string }) => {
      await apiRequest("POST", "/api/news", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      toast({ title: "Success", description: "News posted successfully" });
      setFormData({ title: "", content: "", excerpt: "" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({ title: "Error", description: "Failed to post news", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/news/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      toast({ title: "Success", description: "News deleted successfully" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({ title: "Error", description: "Failed to delete news", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.id) {
      createMutation.mutate({ ...formData, authorId: user.id });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Create News Post</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              data-testid="input-news-title"
            />
          </div>

          <div>
            <Label htmlFor="excerpt">Excerpt (Optional)</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={2}
              data-testid="input-news-excerpt"
            />
          </div>

          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={8}
              required
              data-testid="input-news-content"
            />
          </div>

          <Button type="submit" className="gap-2" disabled={createMutation.isPending} data-testid="button-post-news">
            <Plus className="w-4 h-4" />
            {createMutation.isPending ? "Posting..." : "Post News"}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">All News Posts</h2>
        <div className="space-y-3">
          {news?.map((post) => (
            <div key={post.id} className="flex items-start justify-between p-4 border rounded-md" data-testid={`news-item-${post.id}`}>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{post.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(post.createdAt!), "MMM d, yyyy")}
                </p>
              </div>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => deleteMutation.mutate(post.id)}
                disabled={deleteMutation.isPending}
                data-testid={`button-delete-news-${post.id}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function PickemsManager() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    week: 1,
    pickemUrl: "",
  });

  const { data: pickems } = useQuery<Pickem[]>({
    queryKey: ["/api/pickems"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await apiRequest("POST", "/api/pickems", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pickems"] });
      toast({ title: "Success", description: "Pick'em added successfully" });
      setFormData({ week: 1, pickemUrl: "" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({ title: "Error", description: "Failed to add pick'em", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/pickems/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pickems"] });
      toast({ title: "Success", description: "Pick'em deleted successfully" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({ title: "Error", description: "Failed to delete pick'em", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Add Pick'em Link</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="pickem-week">Week</Label>
            <Input
              id="pickem-week"
              type="number"
              min="1"
              max="18"
              value={formData.week}
              onChange={(e) => setFormData({ ...formData, week: parseInt(e.target.value) })}
              required
              data-testid="input-pickem-week"
            />
          </div>

          <div>
            <Label htmlFor="pickemUrl">Pick'em URL</Label>
            <Input
              id="pickemUrl"
              type="url"
              value={formData.pickemUrl}
              onChange={(e) => setFormData({ ...formData, pickemUrl: e.target.value })}
              placeholder="https://..."
              required
              data-testid="input-pickem-url"
            />
          </div>

          <Button type="submit" className="gap-2" disabled={createMutation.isPending} data-testid="button-add-pickem">
            <Plus className="w-4 h-4" />
            {createMutation.isPending ? "Adding..." : "Add Pick'em"}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">All Pick'ems</h2>
        <div className="space-y-3">
          {pickems?.map((pickem) => (
            <div key={pickem.id} className="flex items-center justify-between p-4 border rounded-md" data-testid={`pickem-item-${pickem.id}`}>
              <div className="flex-1">
                <p className="font-semibold">Week {pickem.week}</p>
                <p className="text-sm text-muted-foreground truncate">{pickem.pickemUrl}</p>
              </div>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => deleteMutation.mutate(pickem.id)}
                disabled={deleteMutation.isPending}
                data-testid={`button-delete-pickem-${pickem.id}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function RulesManager() {
  const { toast } = useToast();
  const [content, setContent] = useState("");

  const { data: rules } = useQuery<PickemRules>({
    queryKey: ["/api/pickems/rules"],
  });

  useEffect(() => {
    if (rules) {
      setContent(rules.content);
    }
  }, [rules]);

  const updateMutation = useMutation({
    mutationFn: async (data: { content: string }) => {
      await apiRequest("POST", "/api/pickems/rules", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pickems/rules"] });
      toast({ title: "Success", description: "Rules updated successfully" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({ title: "Error", description: "Failed to update rules", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ content });
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Edit Pick'em Rules</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="rules">Official Rules</Label>
          <Textarea
            id="rules"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            required
            data-testid="input-rules"
          />
        </div>

        <Button type="submit" className="gap-2" disabled={updateMutation.isPending} data-testid="button-save-rules">
          <Save className="w-4 h-4" />
          {updateMutation.isPending ? "Saving..." : "Save Rules"}
        </Button>
      </form>
    </Card>
  );
}
