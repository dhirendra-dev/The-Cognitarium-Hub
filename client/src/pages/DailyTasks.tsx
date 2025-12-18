import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, Circle, Plus, Calendar } from "lucide-react";
import { toast } from "sonner";

const TASK_SUBJECTS = ["SST", "Science"];

export default function DailyTasks() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskSubject, setNewTaskSubject] = useState("SST");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskNotes, setNewTaskNotes] = useState("");

  // tRPC queries and mutations
  const { data: dailyTasks, refetch: refetchTasks } = trpc.dailyTasks.getByDate.useQuery({
    date: new Date(selectedDate),
  });

  const createTaskMutation = trpc.dailyTasks.create.useMutation({
    onSuccess: () => {
      toast.success("Task added successfully!");
      setNewTaskSubject("SST");
      setNewTaskDescription("");
      setNewTaskNotes("");
      setShowAddForm(false);
      refetchTasks();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add task");
    },
  });

  const toggleTaskMutation = trpc.dailyTasks.toggleCompletion.useMutation({
    onSuccess: () => {
      refetchTasks();
    },
  });

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskDescription) {
      toast.error("Please enter a task description");
      return;
    }

    createTaskMutation.mutate({
      date: new Date(selectedDate),
      subject: newTaskSubject,
      taskDescription: newTaskDescription,
      notes: newTaskNotes || undefined,
    });
  };

  const completedCount = (dailyTasks || []).filter((t) => t.isCompleted).length;
  const totalCount = dailyTasks?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-800">Daily Subject Tasks</h1>
          </div>
          <p className="text-gray-600">Track your daily SST and Science revision tasks</p>
        </div>

        {/* Date Selector */}
        <Card className="bg-white shadow-lg mb-8 p-6">
          <Label htmlFor="date-picker" className="text-sm font-semibold text-gray-700 block mb-3">
            Select Date
          </Label>
          <Input
            id="date-picker"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="max-w-xs"
          />
        </Card>

        {/* Daily Progress */}
        <Card className="bg-white shadow-lg mb-8 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {new Date(selectedDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h2>
              <p className="text-gray-600 mt-2">
                {completedCount} of {totalCount} tasks completed
              </p>
            </div>
            <div className="text-4xl font-bold text-indigo-600">
              {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
            </div>
          </div>
        </Card>

        {/* Tasks by Subject */}
        {TASK_SUBJECTS.map((subject) => {
          const subjectTasks = (dailyTasks || []).filter((t) => t.subject === subject);
          const subjectCompleted = subjectTasks.filter((t) => t.isCompleted).length;

          return (
            <Card key={subject} className="bg-white shadow-lg mb-6 overflow-hidden">
              <div
                className={`h-1 ${
                  subject === "SST" ? "bg-amber-500" : "bg-green-500"
                }`}
              />
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">{subject} Revision</h3>
                  <span className="text-sm font-semibold text-gray-600">
                    {subjectCompleted} of {subjectTasks.length} completed
                  </span>
                </div>

                {subjectTasks.length > 0 ? (
                  <div className="space-y-3">
                    {subjectTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all ${
                          task.isCompleted
                            ? "bg-green-50 border-green-300"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <Checkbox
                          checked={task.isCompleted || false}
                          onCheckedChange={(checked) => {
                            toggleTaskMutation.mutate({
                              taskId: task.id,
                              isCompleted: checked === true,
                            });
                          }}
                          disabled={toggleTaskMutation.isPending}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p
                            className={`font-semibold ${
                              task.isCompleted ? "line-through text-gray-500" : "text-gray-800"
                            }`}
                          >
                            {task.taskDescription}
                          </p>
                          {task.notes && (
                            <p className="text-sm text-gray-700 mt-2 p-2 bg-yellow-50 rounded">
                              {task.notes}
                            </p>
                          )}
                          {task.completedTime && (
                            <p className="text-xs text-green-600 mt-2">
                              ✓ Completed at {new Date(task.completedTime).toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          {task.isCompleted ? (
                            <CheckCircle className="w-6 h-6 text-green-500" />
                          ) : (
                            <Circle className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No tasks for {subject} today</p>
                )}
              </div>
            </Card>
          );
        })}

        {/* Add Task Form */}
        {showAddForm ? (
          <Card className="bg-white shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Add New Task</h3>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <Label htmlFor="subject" className="text-sm font-semibold text-gray-700">
                  Subject
                </Label>
                <select
                  id="subject"
                  value={newTaskSubject}
                  onChange={(e) => setNewTaskSubject(e.target.value)}
                  className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {TASK_SUBJECTS.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="task-desc" className="text-sm font-semibold text-gray-700">
                  Task Description
                </Label>
                <Input
                  id="task-desc"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="e.g., Review Chapter 3: Nationalism in India"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="task-notes" className="text-sm font-semibold text-gray-700">
                  Notes (Optional)
                </Label>
                <Textarea
                  id="task-notes"
                  value={newTaskNotes}
                  onChange={(e) => setNewTaskNotes(e.target.value)}
                  placeholder="Add any additional notes..."
                  className="mt-2 resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={createTaskMutation.isPending}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  {createTaskMutation.isPending ? "Adding..." : "Add Task"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <Button
            onClick={() => setShowAddForm(true)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-6 text-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Task for {new Date(selectedDate).toLocaleDateString()}
          </Button>
        )}
      </div>
    </div>
  );
}
