import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import type { News as NewsType } from "@shared/schema";
import { format } from "date-fns";
import { Plus, AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function News() {
  const { isAuthenticated } = useAuth();

  const { data: news, isLoading, error } = useQuery<NewsType[]>({
    queryKey: ["/api/news"],
  });

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center gap-3 text-destructive">
          <AlertCircle className="w-5 h-5" />
          <p>Failed to load news</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-black mb-4" data-testid="text-page-title">
            Latest News
          </h1>
          <p className="text-muted-foreground text-lg">
            Stay updated with the latest announcements and updates
          </p>
        </div>
        {isAuthenticated && (
          <Link href="/admin">
            <Button className="gap-2" data-testid="button-add-news">
              <Plus className="w-4 h-4" />
              Add News
            </Button>
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      ) : news && news.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((post) => (
            <Card key={post.id} className="p-6 flex flex-col hover-elevate active-elevate-2" data-testid={`card-news-${post.id}`}>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 line-clamp-2" data-testid={`text-title-${post.id}`}>
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4" data-testid={`text-date-${post.id}`}>
                  {format(new Date(post.createdAt!), "MMMM d, yyyy")}
                </p>
                {post.excerpt && (
                  <p className="text-muted-foreground mb-4 line-clamp-3" data-testid={`text-excerpt-${post.id}`}>
                    {post.excerpt}
                  </p>
                )}
                <div className="prose prose-sm max-w-none line-clamp-4" data-testid={`text-content-${post.id}`}>
                  {post.content}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">
            No news posts yet
          </p>
        </div>
      )}
    </div>
  );
}
