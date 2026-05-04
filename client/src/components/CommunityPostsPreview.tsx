import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Heart, MessageCircle, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

export function CommunityPostsPreview() {
  const [, navigate] = useLocation();
  const { data: posts, isLoading } = trpc.posts.getAll.useQuery({ limit: 5 });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-pink-600" />
      </div>
    );
  }

  const displayPosts = posts?.slice(0, 5) || [];

  return (
    <Card className="border-pink-200 hover:shadow-lg transition">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-pink-600" />
            <CardTitle>Community Posts</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/posts")}
            className="text-pink-600 hover:text-pink-700"
          >
            View All →
          </Button>
        </div>
        <CardDescription>Latest updates from community members</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayPosts.length > 0 ? (
            displayPosts.map((post: any) => (
              <div
                key={post.id}
                className="p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-100 hover:border-pink-300 transition cursor-pointer"
                onClick={() => navigate(`/posts/${post.id}`)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-900 truncate">
                      {post.title}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {post.description || "No description"}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                      <span>{post.userName || "Anonymous"}</span>
                      <span>•</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                {/* Engagement Stats */}
                <div className="mt-2 flex items-center gap-4 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-pink-500" />
                    <span>{post.likes || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3 text-blue-500" />
                    <span>{post.replyCount || 0}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-6">No posts yet. Be the first to share!</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
