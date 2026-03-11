import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Trash2, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import PostReplies from "@/components/PostReplies";

export default function Posts() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // tRPC queries and mutations
  const { data: allPosts, refetch: refetchPosts } = trpc.posts.getAll.useQuery({ limit: 50 });
  const createPostMutation = trpc.posts.create.useMutation({
    onSuccess: () => {
      toast.success("Post created successfully!");
      setTitle("");
      setDescription("");
      setPhotoFile(null);
      setPhotoPreview("");
      refetchPosts();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create post");
    },
  });

  const deletePostMutation = trpc.posts.delete.useMutation({
    onSuccess: () => {
      toast.success("Post deleted successfully!");
      refetchPosts();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete post");
    },
  });

  const likePostMutation = trpc.posts.like.useMutation({
    onSuccess: () => {
      refetchPosts();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to like post");
    },
  });

  const uploadPhotoMutation = trpc.posts.uploadPhoto.useMutation({
    onError: (error) => {
      toast.error(error.message || "Failed to upload photo");
    },
  });

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    setIsSubmitting(true);
    try {
      let photoUrl = "";

      // Upload photo if selected
      if (photoFile) {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64Data = (reader.result as string).split(",")[1];
          try {
            const result = await uploadPhotoMutation.mutateAsync({
              fileName: photoFile.name,
              fileData: base64Data,
              mimeType: photoFile.type,
            });
            photoUrl = result.url;
            
            // Create post with photo URL
            createPostMutation.mutate({
              title,
              description: description || undefined,
              photoUrl: photoUrl || undefined,
            });
          } catch (error) {
            toast.error("Failed to upload photo");
            setIsSubmitting(false);
          }
        };
        reader.readAsDataURL(photoFile);
      } else {
        // Create post without photo
        createPostMutation.mutate({
          title,
          description: description || undefined,
          photoUrl: undefined,
        });
      }
    } catch (error) {
      toast.error("Failed to create post");
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = (postId: number) => {
    if (confirm("Are you sure you want to delete this post?")) {
      deletePostMutation.mutate({ postId });
    }
  };

  const handleLikePost = (postId: number, currentLikes: number) => {
    likePostMutation.mutate({ postId, likes: currentLikes + 1 });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Study Updates & Photos</h1>
          <p className="text-gray-600">Share your study journey with the community</p>
        </div>

        {/* Create Post Form */}
        <Card className="bg-white shadow-lg mb-8">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Create a Post</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-sm font-semibold text-gray-700">
                  Title
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="What's your update?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  placeholder="Add more details about your post..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-2 h-24"
                />
              </div>

              <div>
                <Label htmlFor="photo" className="text-sm font-semibold text-gray-700">
                  Upload Photo (Optional)
                </Label>
                <div className="mt-2 flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700 transition-colors">
                    <Upload className="w-5 h-5" />
                    <span>Choose Photo</span>
                    <input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />
                  </label>
                  {photoPreview && (
                    <div className="relative">
                      <img src={photoPreview} alt="Preview" className="w-24 h-24 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoFile(null);
                          setPhotoPreview("");
                        }}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                {isSubmitting ? "Posting..." : "Post Update"}
              </Button>
            </form>
          </div>
        </Card>

        {/* Posts Feed */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Community Updates</h2>
          {allPosts && allPosts.length > 0 ? (
            allPosts.map((post) => (
              <Card key={post.id} className="bg-white shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{post.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(post.createdAt).toLocaleDateString()} • User {post.userId}
                      </p>
                    </div>
                    {user?.role === "admin" && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete post"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {post.photoUrl && (
                    <div className="mb-4 rounded-lg overflow-hidden">
                      <img src={post.photoUrl} alt={post.title} className="w-full h-auto max-h-96 object-cover" />
                    </div>
                  )}

                  {post.description && (
                    <p className="text-gray-700 mb-4">{post.description}</p>
                  )}

                  <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleLikePost(post.id, post.likes || 0)}
                      className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
                    >
                      <Heart className="w-5 h-5" />
                      <span>{post.likes || 0} Likes</span>
                    </button>
                  </div>

                  {/* Post Replies Section */}
                  <PostReplies postId={post.id} />
                </div>
              </Card>
            ))
          ) : (
            <Card className="bg-white shadow-lg p-12 text-center">
              <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No posts yet. Be the first to share your study journey!</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
