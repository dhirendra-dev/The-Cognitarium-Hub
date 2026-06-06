import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit2, Plus } from "lucide-react";
import { toast } from "sonner";

interface Notice {
  id: number;
  title: string;
  content: string;
  type: "announcement" | "important" | "update" | "event" | null;
  priority: number | null;
  isActive: boolean | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
}

export function AdminNoticesTab() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "announcement" as "announcement" | "important" | "update" | "event",
    priority: 0,
  });

  const { data: notices, refetch } = trpc.notices.getAll.useQuery();
  const createMutation = trpc.notices.create.useMutation({
    onSuccess: () => {
      toast.success("Notice created successfully");
      setFormData({ title: "", content: "", type: "announcement", priority: 0 });
      setIsCreating(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create notice");
    },
  });

  const updateMutation = trpc.notices.update.useMutation({
    onSuccess: () => {
      toast.success("Notice updated successfully");
      setEditingId(null);
      setFormData({ title: "", content: "", type: "announcement", priority: 0 });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update notice");
    },
  });

  const deleteMutation = trpc.notices.delete.useMutation({
    onSuccess: () => {
      toast.success("Notice deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete notice");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (editingId) {
      updateMutation.mutate({
        noticeId: editingId,
        title: formData.title,
        content: formData.content,
        type: formData.type,
        priority: formData.priority,
      });
    } else {
      createMutation.mutate({
        title: formData.title,
        content: formData.content,
        type: formData.type,
        priority: formData.priority,
      });
    }
  };

  const handleEdit = (notice: Notice) => {
    setEditingId(notice.id);
    setFormData({
      title: notice.title,
      content: notice.content,
      type: notice.type || "announcement",
      priority: notice.priority || 0,
    });
    setIsCreating(false);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({ title: "", content: "", type: "announcement", priority: 0 });
  };

  const getTypeColor = (type: string | null) => {
    switch (type) {
      case "important":
        return "bg-red-100 text-red-800";
      case "announcement":
        return "bg-blue-100 text-blue-800";
      case "update":
        return "bg-yellow-100 text-yellow-800";
      case "event":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle>{editingId ? "Edit Notice" : "Create New Notice"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Notice title"
                  disabled={createMutation.isPending || updateMutation.isPending}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Notice content"
                  rows={4}
                  disabled={createMutation.isPending || updateMutation.isPending}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        type: value as "announcement" | "important" | "update" | "event",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="important">Important</SelectItem>
                      <SelectItem value="update">Update</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <Input
                    type="number"
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })
                    }
                    min="0"
                    max="100"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingId ? "Update Notice" : "Create Notice"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Create Button */}
      {!isCreating && !editingId && (
        <Button onClick={() => setIsCreating(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create New Notice
        </Button>
      )}

      {/* Notices List */}
      <div className="space-y-3">
        {notices && notices.length > 0 ? (
          notices.map((notice) => (
            <Card key={notice.id} className="border-gray-200">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h4 className="font-semibold text-gray-900 break-words">
                        {notice.title}
                      </h4>
                      <Badge className={getTypeColor(notice.type)}>
                        {notice.type || "announcement"}
                      </Badge>
                      {!notice.isActive && (
                        <Badge variant="outline" className="bg-gray-100">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                      {notice.content}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Priority: {notice.priority || 0}</span>
                      <span>
                        {new Date(notice.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(notice)}
                      disabled={updateMutation.isPending || deleteMutation.isPending}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteMutation.mutate({ noticeId: notice.id })}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="pt-6 text-center">
              <p className="text-gray-500">No notices yet. Create one to get started!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
