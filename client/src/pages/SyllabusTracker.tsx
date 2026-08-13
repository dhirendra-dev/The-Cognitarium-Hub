import { useMemo, useState } from "react";
import { BookOpen, CheckCircle2, Filter, Loader, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const EXAM_FILTERS = [
  { value: "all", label: "All tracks" },
  { value: "11", label: "Class 11" },
  { value: "12", label: "Class 12" },
  { value: "jeeMain", label: "JEE Main" },
  { value: "jeeAdvanced", label: "JEE Advanced" },
] as const;

export default function SyllabusTracker() {
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [examFilter, setExamFilter] = useState<(typeof EXAM_FILTERS)[number]["value"]>("all");
  const queryInput = useMemo(
    () => ({
      ...(subjectFilter !== "all" ? { subject: subjectFilter } : {}),
      ...(examFilter !== "all" ? { exam: examFilter } : {}),
    }),
    [examFilter, subjectFilter]
  );
  const syllabusQuery = trpc.syllabus.list.useQuery(queryInput);
  const utils = trpc.useUtils();
  const updateProgress = trpc.syllabus.updateProgress.useMutation({
    onSuccess: async () => {
      await utils.syllabus.list.invalidate();
      toast.success("Progress saved.");
    },
    onError: (error) => toast.error(error.message || "Could not save progress."),
  });

  const topics = syllabusQuery.data ?? [];
  const subjects = useMemo(
    () => Array.from(new Set(topics.map((topic) => topic.subject))).sort(),
    [topics]
  );
  const grouped = useMemo(() => {
    const result = new Map<string, Map<string, typeof topics>>();
    for (const topic of topics) {
      if (!result.has(topic.subject)) result.set(topic.subject, new Map());
      const units = result.get(topic.subject)!;
      if (!units.has(topic.unit)) units.set(topic.unit, []);
      units.get(topic.unit)!.push(topic);
    }
    return result;
  }, [topics]);

  const completedCount = topics.filter((topic) => topic.progress.status === "completed" || topic.progress.status === "revised").length;
  const progressPercent = topics.length ? Math.round((completedCount / topics.length) * 100) : 0;

  const toggleTopic = (topic: (typeof topics)[number]) => {
    const completed = topic.progress.status === "completed" || topic.progress.status === "revised";
    updateProgress.mutate({
      topicId: topic.id,
      status: completed ? "inProgress" : "completed",
      completionPercentage: completed ? 50 : 100,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 rounded-2xl bg-gradient-to-r from-indigo-700 to-slate-900 p-6 text-white shadow-xl md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-indigo-200" aria-hidden="true" />
                <h1 className="text-3xl font-bold">PCM Syllabus Tracker</h1>
              </div>
              <p className="max-w-2xl text-indigo-100">Track the active syllabus from one source of truth. Topics are loaded from the admin-managed syllabus database.</p>
            </div>
            <div className="rounded-xl bg-white/10 px-5 py-4 text-center">
              <p className="text-sm text-indigo-100">Overall completion</p>
              <p className="text-3xl font-bold">{progressPercent}%</p>
              <p className="text-xs text-indigo-200">{completedCount} of {topics.length} topics</p>
            </div>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
        </header>

        <section className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Filter className="h-4 w-4" /> Filters</div>
          <label className="sr-only" htmlFor="syllabus-subject">Subject</label>
          <select id="syllabus-subject" value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
            <option value="all">All subjects</option>
            {subjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
          </select>
          <label className="sr-only" htmlFor="syllabus-exam">Exam track</label>
          <select id="syllabus-exam" value={examFilter} onChange={(event) => setExamFilter(event.target.value as typeof examFilter)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
            {EXAM_FILTERS.map((filter) => <option key={filter.value} value={filter.value}>{filter.label}</option>)}
          </select>
          <span className="text-xs text-slate-500 md:ml-auto">{syllabusQuery.isFetching ? "Refreshing…" : `${topics.length} topic${topics.length === 1 ? "" : "s"} shown`}</span>
        </section>

        {syllabusQuery.isLoading ? (
          <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-16 text-slate-500"><Loader className="mr-2 h-5 w-5 animate-spin" /> Loading syllabus…</div>
        ) : syllabusQuery.isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">Could not load the syllabus. Please refresh and try again.</div>
        ) : topics.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
            <BookOpen className="mx-auto mb-4 h-10 w-10 text-slate-400" />
            <h2 className="text-xl font-semibold text-slate-800">No syllabus topics are published yet</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">The tracker is ready for the admin-managed Mathematics, Physics, and Chemistry rows. Once the PDF syllabus is re-uploaded and imported, topics will appear here without another UI rewrite.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {Array.from(grouped.entries()).map(([subject, units]) => (
              <section key={subject} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-2xl font-bold text-slate-900">{subject}</h2>
                <div className="space-y-4">
                  {Array.from(units.entries()).map(([unit, unitTopics]) => {
                    const unitCompleted = unitTopics.filter((topic) => topic.progress.status === "completed" || topic.progress.status === "revised").length;
                    return (
                      <div key={unit} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-3 flex items-center justify-between gap-4">
                          <h3 className="font-semibold text-slate-800">{unit}</h3>
                          <span className="text-xs text-slate-500">{unitCompleted}/{unitTopics.length} complete</span>
                        </div>
                        <div className="space-y-2">
                          {unitTopics.map((topic) => {
                            const complete = topic.progress.status === "completed" || topic.progress.status === "revised";
                            return (
                              <div key={topic.id} className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 md:flex-row md:items-center md:justify-between">
                                <div className="min-w-0">
                                  <p className={`font-medium ${complete ? "text-emerald-700" : "text-slate-800"}`}>{topic.topic}</p>
                                  <p className="mt-1 text-xs text-slate-500">{topic.class === "jeeMain" ? "JEE Main" : topic.class === "jeeAdvanced" ? "JEE Advanced" : `Class ${topic.class}`}{topic.subtopic ? ` · ${topic.subtopic}` : ""}</p>
                                </div>
                                <button type="button" onClick={() => toggleTopic(topic)} disabled={updateProgress.isPending} className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${complete ? "bg-emerald-100 text-emerald-700 hover:bg-amber-100 hover:text-amber-700" : "bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-700"}`}>
                                  {complete ? <><CheckCircle2 className="h-4 w-4" /> Completed</> : <><RotateCcw className="h-4 w-4" /> Mark complete</>}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
