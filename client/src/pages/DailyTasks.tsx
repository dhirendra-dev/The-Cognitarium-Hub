import { useMemo, useState } from "react";
import { Calendar, CheckCircle, Circle, Loader, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function DailyTasks() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskSubject, setNewTaskSubject] = useState("Mathematics");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskNotes, setNewTaskNotes] = useState("");
  const dateInput = useMemo(() => ({ date: new Date(`${selectedDate}T00:00:00`) }), [selectedDate]);
  const { data: dailyTasks, refetch: refetchTasks, isLoading } = trpc.dailyTasks.getByDate.useQuery(dateInput);
  const { data: syllabusTopics } = trpc.syllabus.list.useQuery(undefined);
  const subjects = useMemo(() => {
    const values = new Set((syllabusTopics ?? []).map((topic) => topic.subject));
    (dailyTasks ?? []).forEach((task) => values.add(task.subject));
    return Array.from(values).sort();
  }, [dailyTasks, syllabusTopics]);

  const createTaskMutation = trpc.dailyTasks.create.useMutation({
    onSuccess: async () => {
      toast.success("Task added.");
      setNewTaskDescription("");
      setNewTaskNotes("");
      setShowAddForm(false);
      await refetchTasks();
    },
    onError: (error) => toast.error(error.message || "Could not add task."),
  });
  const generateMutation = trpc.dailyTasks.generateFromSyllabus.useMutation({
    onSuccess: async (result) => {
      toast.success(result.created ? `${result.created} syllabus review task${result.created === 1 ? "" : "s"} created.` : "No new tasks were needed for this date.");
      await refetchTasks();
    },
    onError: (error) => toast.error(error.message || "Could not generate syllabus tasks."),
  });
  const toggleTaskMutation = trpc.dailyTasks.toggleCompletion.useMutation({
    onSuccess: () => refetchTasks(),
    onError: (error) => toast.error(error.message || "Could not update task."),
  });

  const tasks = dailyTasks ?? [];
  const completedCount = tasks.filter((task) => task.isCompleted).length;
  const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;
  const groupedTasks = useMemo(() => {
    const groups = new Map<string, typeof tasks>();
    tasks.forEach((task) => {
      if (!groups.has(task.subject)) groups.set(task.subject, []);
      groups.get(task.subject)!.push(task);
    });
    return groups;
  }, [tasks]);

  const handleAddTask = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newTaskDescription.trim()) {
      toast.error("Enter a task description first.");
      return;
    }
    createTaskMutation.mutate({
      date: dateInput.date,
      subject: newTaskSubject.trim() || "General",
      taskDescription: newTaskDescription.trim(),
      notes: newTaskNotes.trim() || undefined,
    });
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-8 animate-in fade-in duration-300">
      <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-accent/30 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="ink-kicker mb-3">Daily study checklist</p>
            <h1 className="display-serif text-3xl font-bold tracking-tight sm:text-5xl">Daily Study Tasks</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">Generate a focused checklist from the published PCM syllabus, then add personal study items when needed.</p>
          </div>
          <Card className="rounded-[1.5rem] bg-primary p-5 text-primary-foreground shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-primary-foreground/75">Progress for today</p>
            <p className="mt-1 text-3xl font-black">{progress}% <span className="text-xs font-semibold text-primary-foreground/75">({completedCount}/{tasks.length})</span></p>
            <div className="mt-3 h-2 w-48 overflow-hidden rounded-full bg-black/15">
              <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progress}%` }} />
            </div>
          </Card>
        </div>
      </section>

      <Card className="elevated-card rounded-[2rem] p-6 sm:p-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <label htmlFor="task-date" className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Select Study Date</label>
          <input
            id="task-date"
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground focus:outline-primary"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={() => generateMutation.mutate({ date: dateInput.date, count: 5 })}
            disabled={generateMutation.isPending}
            className="rounded-full px-6 font-bold shadow-sm"
          >
            <Sparkles className="mr-2 h-4 w-4" /> {generateMutation.isPending ? "Generating..." : "Generate from syllabus"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowAddForm((value) => !value)}
            className="rounded-full px-5 font-bold bg-card"
          >
            <Plus className="mr-2 h-4 w-4" /> Add custom task
          </Button>
        </div>
      </Card>

      {showAddForm && (
        <Card className="elevated-card rounded-[2rem] p-6 sm:p-8 border border-primary/40 bg-card/90">
          <form onSubmit={handleAddTask} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">Subject</label>
              <select
                value={newTaskSubject}
                onChange={(event) => setNewTaskSubject(event.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground"
              >
                <option value="General">General</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">Task Description</label>
              <input
                value={newTaskDescription}
                onChange={(event) => setNewTaskDescription(event.target.value)}
                placeholder="e.g. Revise electrostatics derivations"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">Notes (optional)</label>
              <textarea
                value={newTaskNotes}
                onChange={(event) => setNewTaskNotes(event.target.value)}
                placeholder="Add formula reminders or chapter references..."
                className="w-full rounded-xl border border-border bg-background p-4 text-sm font-semibold text-foreground min-h-24"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowAddForm(false)} className="rounded-full px-6 font-bold">Cancel</Button>
              <Button type="submit" disabled={createTaskMutation.isPending} className="rounded-full px-6 font-bold">
                {createTaskMutation.isPending ? "Adding..." : "Save Task"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center rounded-[2rem] bg-card p-16 text-muted-foreground border border-border">
          <Loader className="mr-3 h-5 w-5 animate-spin text-primary" /> Loading today's study plan...
        </div>
      ) : tasks.length === 0 ? (
        <Card className="rounded-[2rem] p-12 text-center space-y-4 border border-dashed border-border bg-card">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">No tasks for this date</h3>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">Generate a checklist instantly from the published PCM syllabus or add your own custom tasks.</p>
          </div>
          <Button onClick={() => generateMutation.mutate({ date: dateInput.date, count: 5 })} className="rounded-full px-6 font-bold">
            <Sparkles className="mr-2 h-4 w-4" /> Generate from Syllabus
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {Array.from(groupedTasks.entries()).map(([subject, subjectTasks]) => (
            <Card key={subject} className="elevated-card rounded-[2rem] p-6 sm:p-8 space-y-4 border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <h3 className="text-xl font-bold tracking-tight text-foreground">{subject}</h3>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-black uppercase text-muted-foreground">
                  {subjectTasks.filter((task) => task.isCompleted).length} / {subjectTasks.length} done
                </span>
              </div>
              <div className="space-y-3">
                {subjectTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-start gap-4 rounded-2xl border p-4 transition-all ${
                      task.isCompleted ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-900 dark:text-emerald-200" : "border-border/80 bg-background/50 hover:bg-muted/30"
                    }`}
                  >
                    <button
                      type="button"
                      aria-label={task.isCompleted ? "Mark task incomplete" : "Mark task complete"}
                      onClick={() => toggleTaskMutation.mutate({ taskId: task.id, isCompleted: !task.isCompleted })}
                      disabled={toggleTaskMutation.isPending}
                      className="mt-0.5 shrink-0 text-primary transition-transform hover:scale-110"
                    >
                      {task.isCompleted ? <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" /> : <Circle className="h-6 w-6 text-muted-foreground" />}
                    </button>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className={`font-bold text-base ${task.isCompleted ? "line-through opacity-75" : "text-foreground"}`}>
                        {task.taskDescription}
                      </p>
                      {task.notes && (
                        <p className="rounded-xl bg-card p-3 text-xs font-semibold text-muted-foreground border border-border/50">
                          {task.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
