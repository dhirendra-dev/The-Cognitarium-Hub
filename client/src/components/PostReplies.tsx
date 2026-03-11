import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Send, Trash2, Heart } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface PostRepliesProps {
  postId: number;
}

export default function PostReplies({ postId }: PostRepliesProps) {
  const [replyText, setReplyText] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: replies, refetch } = trpc.postReplies.getByPost.useQuery(
    { postId },
    { enabled: isExpanded }
  );

  const { data: replyCount } = trpc.postReplies.getCount.useQuery({ postId });

  const createReplyMutation = trpc.postReplies.create.useMutation({
    onSuccess: () => {
      toast.success("Reply posted!");
      setReplyText("");
      refetch();
    },
    onError: () => {
      toast.error("Failed to post reply");
    },
  });

  const deleteReplyMutation = trpc.postReplies.delete.useMutation({
    onSuccess: () => {
      toast.success("Reply deleted");
      refetch();
    },
  });

  const handlePostReply = () => {
    if (!replyText.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }

    createReplyMutation.mutate({
      postId,
      replyText,
    });
  };

  return (
    <div className="space-y-4 mt-4">
      {/* Reply Count & Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="gap-2 text-gray-600 hover:text-blue-600"
      >
        <MessageCircle className="w-4 h-4" />
        {replyCount || 0} Replies
      </Button>

      {/* Expanded Replies Section */}
      {isExpanded && (
        <div className="space-y-4 pl-4 border-l-2 border-blue-200">
          {/* Reply Input */}
          <div className="space-y-2">
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="min-h-20 resize-none"
            />
            <Button
              onClick={handlePostReply}
              disabled={createReplyMutation.isPending || !replyText.trim()}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              <Send className="w-4 h-4" />
              Post Reply
            </Button>
          </div>

          {/* Replies List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {replies && replies.length > 0 ? (
              replies.map((reply) => (
                <Card key={reply.id} className="bg-gray-50 border-gray-200">
                  <CardContent className="pt-4">
                    <div className="flex gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium text-sm">User</div>
                          <div className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(reply.createdAt), {
                              addSuffix: true,
                            })}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{reply.replyText}</p>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-gray-600 hover:text-red-600"
                          >
                            <Heart className="w-3 h-3" />
                            {reply.likes || 0}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteReplyMutation.mutate({ id: reply.id })}
                            className="gap-1 text-gray-600 hover:text-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-gray-500 text-sm py-4">
                No replies yet. Be the first to reply!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
