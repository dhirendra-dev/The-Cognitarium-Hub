import { useMemo, useState } from "react";
import { Calendar, CheckCircle, Circle, Loader, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

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
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 rounded-2xl bg-gradient-to-r from-indigo-700 to-violet-800 p-6 text-white shadow-xl md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3"><Calendar className="h-8 w-8 text-indigo-200" /><h1 className="text-3xl font-bold">Daily Study Tasks</h1></div>
              <p className="max-w-2xl text-indigo-100">Generate a focused checklist from the published PCM syllabus, then add personal tasks when needed.</p>
            </div>
            <div className="rounded-xl bg-white/10 px-5 py-4 text-center"><p className="text-sm text-indigo-100">{completedCount} of {tasks.length} complete</p><p className="text-3xl font-bold">{progress}%</p></div>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${progress}%` }} /></div>
        </header>

        <section className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div><label htmlFor="task-date" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Study date</label><input id="task-date" type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700" /></div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => generateMutation.mutate({ date: dateInput.date, count: 5 })} disabled={generateMutation.isPending} className="inline-flex items-center gap-2 rounded-lg bg-indigo-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-800 disabled:bg-slate-400"><Sparkles className="h-4 w-4" />{generateMutation.isPending ? "Generating…" : "Generate from syllabus"}</button>
            <button type="button" onClick={() => setShowAddForm((value) => !value)} className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"><Plus className="h-4 w-4" /> Add task</button>
          </div>
        </section>

        {showAddForm && <form onSubmit={handleAddTask} className="mb-6 grid gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-5 md:grid-cols-2"><select value={newTaskSubject} onChange={(event) => setNewTaskSubject(event.target.value)} className="rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm"><option value="General">General</option>{subjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}</select><input value={newTaskDescription} onChange={(event) => setNewTaskDescription(event.target.value)} placeholder="Task description" className="rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm" /><textarea value={newTaskNotes} onChange={(event) => setNewTaskNotes(event.target.value)} placeholder="Notes (optional)" className="min-h-20 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm md:col-span-2" /><button type="submit" disabled={createTaskMutation.isPending} className="rounded-lg bg-indigo-700 px-4 py-2.5 font-semibold text-white hover:bg-indigo-800 disabled:bg-slate-400 md:col-span-2">{createTaskMutation.isPending ? "Adding…" : "Save personal task"}</button></form>}

        {isLoading ? <div className="flex items-center justify-center rounded-xl bg-white p-16 text-slate-500"><Loader className="mr-2 h-5 w-5 animate-spin" /> Loading tasks…</div> : tasks.length === 0 ? <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm"><Sparkles className="mx-auto mb-4 h-10 w-10 text-indigo-400" /><h2 className="text-xl font-semibold text-slate-800">No tasks for this date</h2><p className="mt-2 text-sm text-slate-500">Generate a checklist from the active syllabus or add a personal study task.</p></div> : <div className="space-y-5">{Array.from(groupedTasks.entries()).map(([subject, subjectTasks]) => <section key={subject} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold text-slate-900">{subject}</h2><span className="text-sm text-slate-500">{subjectTasks.filter((task) => task.isCompleted).length}/{subjectTasks.length}</span></div><div className="space-y-3">{subjectTasks.map((task) => <div key={task.id} className={`flex items-start gap-3 rounded-lg border p-4 ${task.isCompleted ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}><button type="button" aria-label={task.isCompleted ? "Mark task incomplete" : "Mark task complete"} onClick={() => toggleTaskMutation.mutate({ taskId: task.id, isCompleted: !task.isCompleted })} disabled={toggleTaskMutation.isPending} className="mt-0.5 shrink-0 text-emerald-600">{task.isCompleted ? <CheckCircle className="h-5 w-5" /> : <Circle className="h-5 w-5 text-slate-400" />}</button><div className="min-w-0 flex-1"><p className={`font-semibold ${task.isCompleted ? "text-emerald-800 line-through" : "text-slate-800"}`}>{task.taskDescription}</p>{task.notes && <p className="mt-2 rounded bg-white/70 p-2 text-sm text-slate-600">{task.notes}</p>}</div></div>)}</div></section>)}</div>}
      </div>
    </div>
  );
}
