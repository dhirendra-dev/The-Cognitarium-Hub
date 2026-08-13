import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_SUBJECTS = [
  { name: "Advanced Mathematics", color: "#3b82f6" },
  { name: "Science", color: "#10b981" },
  { name: "SST", color: "#f59e0b" },
  { name: "English", color: "#8b5cf6" },
  { name: "Hindi", color: "#ec4899" },
  { name: "Optional Subject", color: "#14b8a6" },
];

export default function SubjectsTracker() {
  const { user } = useAuth();
  const [expandedSubject, setExpandedSubject] = useState<number | null>(null);
  const [newTopicSubjectId, setNewTopicSubjectId] = useState<number | null>(null);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicDescription, setNewTopicDescription] = useState("");

  // tRPC queries and mutations
  const { data: subjects, refetch: refetchSubjects } = trpc.subjects.getByUser.useQuery();
  const { data: allTopics, refetch: refetchTopics } = trpc.topics.getBySubject.useQuery(
    { subjectId: expandedSubject || 0 },
    { enabled: !!expandedSubject }
  );

  const createSubjectMutation = trpc.subjects.create.useMutation({
    onSuccess: () => {
      toast.success("Subject created!");
      refetchSubjects();
    },
  });

  const createTopicMutation = trpc.topics.create.useMutation({
    onSuccess: () => {
      toast.success("Topic added!");
      setNewTopicTitle("");
      setNewTopicDescription("");
      setNewTopicSubjectId(null);
      refetchTopics();
    },
  });

  const toggleTopicMutation = trpc.topics.toggleCompletion.useMutation({
    onSuccess: () => {
      refetchTopics();
    },
  });

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle || !newTopicSubjectId) {
      toast.error("Please fill in all required fields");
      return;
    }

    createTopicMutation.mutate({
      subjectId: newTopicSubjectId,
      title: newTopicTitle,
      description: newTopicDescription || undefined,
    });
  };

  const handleAddDefaultSubjects = async () => {
    for (const subject of DEFAULT_SUBJECTS) {
      await createSubjectMutation.mutateAsync({
        name: subject.name,
        color: subject.color,
        isCustom: false,
      });
    }
    toast.success("Default subjects added!");
  };

  // Calculate progress for a subject
  const calculateProgress = (subjectId: number) => {
    if (!allTopics) return 0;
    const completed = allTopics.filter((t) => t.isCompleted).length;
    return allTopics.length > 0 ? Math.round((completed / allTopics.length) * 100) : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-800">Subject Completion Tracker</h1>
          </div>
          <p className="text-gray-600">Track your progress across all subjects</p>
        </div>

        {/* Initialize Subjects Button */}
        {!subjects || subjects.length === 0 ? (
          <Card className="bg-white shadow-lg mb-8 p-8 text-center">
            <p className="text-gray-700 mb-4">No subjects yet. Would you like to add the default HSLC subjects?</p>
            <Button
              onClick={handleAddDefaultSubjects}
              disabled={createSubjectMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            >
              {createSubjectMutation.isPending ? "Adding..." : "Add Default Subjects"}
            </Button>
          </Card>
        ) : null}

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subjects?.map((subject) => {
            const isExpanded = expandedSubject === subject.id;
            const subjectTopics = allTopics || [];
            const completedCount = subjectTopics.filter((t) => t.isCompleted).length;
            const totalCount = subjectTopics.length;
            const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

            return (
              <Card key={subject.id} className="bg-white shadow-lg overflow-hidden">
                  <div
                    className="h-2"
                    style={{ backgroundColor: subject.color || "#3b82f6" }}
                  />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{subject.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {completedCount} of {totalCount} topics completed
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedSubject(isExpanded ? null : subject.id)}
                    >
                      {isExpanded ? <ChevronUp /> : <ChevronDown />}
                    </Button>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-700">Progress</span>
                      <span className="text-sm font-bold text-indigo-600">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      {/* Topics List */}
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-800 mb-4">Topics & Chapters</h4>
                        {subjectTopics.length > 0 ? (
                          <div className="space-y-3">
                            {subjectTopics.map((topic) => (
                              <div key={topic.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <Checkbox
                                  checked={topic.isCompleted || false}
                                  onCheckedChange={(checked) => {
                                    toggleTopicMutation.mutate({
                                      topicId: topic.id,
                                      isCompleted: checked === true,
                                    });
                                  }}
                                  className="mt-1"
                                />
                                <div className="flex-1">
                                  <p
                                    className={`font-semibold ${
                                      topic.isCompleted ? "line-through text-gray-500" : "text-gray-800"
                                    }`}
                                  >
                                    {topic.title}
                                  </p>
                                  {topic.description && (
                                    <p className="text-sm text-gray-600 mt-1">{topic.description}</p>
                                  )}
                                  {topic.notes && (
                                    <p className="text-sm text-gray-700 mt-2 p-2 bg-yellow-50 rounded">
                                      {topic.notes}
                                    </p>
                                  )}
                                  {topic.completedDate && (
                                    <p className="text-xs text-green-600 mt-2">
                                      ✓ Completed on {new Date(topic.completedDate).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">No topics added yet</p>
                        )}
                      </div>

                      {/* Add Topic Form */}
                      {newTopicSubjectId === subject.id ? (
                        <form onSubmit={handleAddTopic} className="bg-indigo-50 p-4 rounded-lg space-y-3">
                          <div>
                            <Label htmlFor="topic-title" className="text-sm font-semibold text-gray-700">
                              Topic/Chapter Title
                            </Label>
                            <Input
                              id="topic-title"
                              value={newTopicTitle}
                              onChange={(e) => setNewTopicTitle(e.target.value)}
                              placeholder="e.g., Chapter 5: Quadratic Equations"
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label htmlFor="topic-desc" className="text-sm font-semibold text-gray-700">
                              Description (Optional)
                            </Label>
                            <Textarea
                              id="topic-desc"
                              value={newTopicDescription}
                              onChange={(e) => setNewTopicDescription(e.target.value)}
                              placeholder="Add any notes or details..."
                              className="mt-2 resize-none"
                              rows={2}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="submit"
                              disabled={createTopicMutation.isPending}
                              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                            >
                              {createTopicMutation.isPending ? "Adding..." : "Add Topic"}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setNewTopicSubjectId(null);
                                setNewTopicTitle("");
                                setNewTopicDescription("");
                              }}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <Button
                          onClick={() => setNewTopicSubjectId(subject.id)}
                          variant="outline"
                          className="w-full border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Topic
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
