import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GameCard } from "@/components/GameCard";
import type { Game, News as NewsType } from "@shared/schema";
import { useLocation } from "wouter";
import { ArrowRight, Calendar, MessageSquare, Trophy, Newspaper, Target } from "lucide-react";
import { format } from "date-fns";

export default function Landing() {
  const [, setLocation] = useLocation();

  const { data: games, isLoading: gamesLoading } = useQuery<Game[]>({
    queryKey: ["/api/games/current"],
  });

  const { data: news, isLoading: newsLoading } = useQuery<NewsType[]>({
    queryKey: ["/api/news"],
  });

  const currentWeek = games && games.length > 0 ? games[0].week : 1;
  const featuredNews = news?.slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-20">
          <Badge className="mb-4 px-4 py-2" variant="outline">
            BFFL Season 1
          </Badge>
          <h1 className="text-5xl md:text-7xl font-black mb-6" data-testid="text-hero-title">
            BFFL Fan Hub
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-2">
            FFN Network
          </p>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Your ultimate destination for live scores, real-time discussion, and everything BFFL
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" onClick={() => setLocation("/scores")} className="gap-2" data-testid="button-view-scores">
              <Trophy className="w-5 h-5" />
              Live Scores
            </Button>
            <Button size="lg" variant="outline" onClick={() => setLocation("/schedule")} data-testid="button-view-schedule">
              View Schedule
            </Button>
          </div>
        </div>

        {/* Current Week Games */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-black mb-2" data-testid="text-this-week">
                Week {currentWeek} Games
              </h2>
              <p className="text-muted-foreground">Follow all the action this week</p>
            </div>
            <Button variant="outline" onClick={() => setLocation("/scores")} className="gap-2">
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {gamesLoading ? (
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
            <Card className="p-12 text-center">
              <p className="text-muted-foreground text-lg">No games scheduled yet</p>
            </Card>
          )}
        </div>

        {/* Latest News */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-black mb-2" data-testid="text-latest-news">
                Latest News
              </h2>
              <p className="text-muted-foreground">Stay updated with the newest announcements</p>
            </div>
            <Button variant="outline" onClick={() => setLocation("/news")} className="gap-2">
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {newsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-80" />
              ))}
            </div>
          ) : featuredNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredNews.map((post) => (
                <Card key={post.id} className="p-6 flex flex-col hover-elevate" data-testid={`news-card-${post.id}`}>
                  <h3 className="text-lg font-bold mb-2 line-clamp-2" data-testid={`news-title-${post.id}`}>
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4" data-testid={`news-date-${post.id}`}>
                    {format(new Date(post.createdAt!), "MMM d, yyyy")}
                  </p>
                  {post.excerpt && (
                    <p className="text-muted-foreground mb-4 line-clamp-3 flex-1" data-testid={`news-excerpt-${post.id}`}>
                      {post.excerpt}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground text-lg">No news yet</p>
            </Card>
          )}
        </div>

        {/* Feature Highlights */}
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-black mb-8 text-center">Everything You Need</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 hover-elevate">
              <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center mb-4">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Live Scores</h3>
              <p className="text-muted-foreground mb-4">
                Follow every game with real-time score updates and live status indicators
              </p>
              <Button variant="ghost" size="sm" onClick={() => setLocation("/scores")} className="gap-2">
                View <ArrowRight className="w-4 h-4" />
              </Button>
            </Card>

            <Card className="p-6 hover-elevate">
              <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Live Chat</h3>
              <p className="text-muted-foreground mb-4">
                Join the conversation with fans in real-time during every game
              </p>
              <Button variant="ghost" size="sm" onClick={() => games?.length ? setLocation(`/game/${games[0].id}`) : null} className="gap-2">
                Chat <ArrowRight className="w-4 h-4" />
              </Button>
            </Card>

            <Card className="p-6 hover-elevate">
              <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Full Schedule</h3>
              <p className="text-muted-foreground mb-4">
                Never miss a game with our complete season schedule and results
              </p>
              <Button variant="ghost" size="sm" onClick={() => setLocation("/schedule")} className="gap-2">
                Schedule <ArrowRight className="w-4 h-4" />
              </Button>
            </Card>

            <Card className="p-6 hover-elevate">
              <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center mb-4">
                <Newspaper className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Latest News</h3>
              <p className="text-muted-foreground mb-4">
                Stay updated with breaking news and important announcements
              </p>
              <Button variant="ghost" size="sm" onClick={() => setLocation("/news")} className="gap-2">
                News <ArrowRight className="w-4 h-4" />
              </Button>
            </Card>

            <Card className="p-6 hover-elevate">
              <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Weekly Pick'ems</h3>
              <p className="text-muted-foreground mb-4">
                Test your predictions with our weekly pick'em challenges
              </p>
              <Button variant="ghost" size="sm" onClick={() => setLocation("/pickems")} className="gap-2">
                Pick'ems <ArrowRight className="w-4 h-4" />
              </Button>
            </Card>

            <Card className="p-6 hover-elevate">
              <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center mb-4">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Game Archives</h3>
              <p className="text-muted-foreground mb-4">
                Browse complete results from all previous weeks of the season
              </p>
              <Button variant="ghost" size="sm" onClick={() => setLocation("/previous-weeks")} className="gap-2">
                Archives <ArrowRight className="w-4 h-4" />
              </Button>
            </Card>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="text-center py-12 border-t">
          <p className="text-lg text-muted-foreground mb-6">
            Ready to manage your BFFL content? Log in as admin to post games, news, and more.
          </p>
          <a href="/api/login">
            <Button size="lg" data-testid="button-admin-login">
              Admin Login
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
