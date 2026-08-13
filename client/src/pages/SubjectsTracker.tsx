import { useMemo, useState } from "react";
import { BookOpen, CheckCircle2, ChevronDown, ChevronUp, Loader } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function SubjectsTracker() {
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const syllabusQuery = trpc.syllabus.list.useQuery(undefined);
  const utils = trpc.useUtils();
  const updateProgress = trpc.syllabus.updateProgress.useMutation({
    onSuccess: async () => {
      await utils.syllabus.list.invalidate();
      toast.success("Topic progress saved.");
    },
    onError: (error) => toast.error(error.message || "Could not save progress."),
  });
  const topics = syllabusQuery.data ?? [];
  const grouped = useMemo(() => {
    const result = new Map<string, typeof topics>();
    topics.forEach((topic) => {
      if (!result.has(topic.subject)) result.set(topic.subject, []);
      result.get(topic.subject)!.push(topic);
    });
    return result;
  }, [topics]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-900 p-6 text-white shadow-xl md:p-8">
          <div className="flex items-center gap-3"><BookOpen className="h-9 w-9 text-blue-200" /><div><h1 className="text-3xl font-bold">Subjects</h1><p className="mt-1 text-blue-100">Explore the published PCM syllabus and keep each topic moving.</p></div></div>
        </header>

        {syllabusQuery.isLoading ? <div className="flex items-center justify-center rounded-xl bg-white p-16 text-slate-500"><Loader className="mr-2 h-5 w-5 animate-spin" /> Loading subjects…</div> : syllabusQuery.isError ? <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">Could not load subjects. Please refresh and try again.</div> : topics.length === 0 ? <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm"><BookOpen className="mx-auto mb-4 h-10 w-10 text-slate-400" /><h2 className="text-xl font-semibold text-slate-800">No published subjects yet</h2><p className="mt-2 text-sm text-slate-500">An administrator can publish the PDF-defined syllabus rows from Admin → Syllabus.</p></div> : <div className="grid gap-5 md:grid-cols-2">{Array.from(grouped.entries()).map(([subject, subjectTopics]) => { const expanded = expandedSubject === subject; const complete = subjectTopics.filter((topic) => topic.progress.status === "completed" || topic.progress.status === "revised").length; const percent = Math.round((complete / subjectTopics.length) * 100); return <section key={subject} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600" /><div className="p-5"><div className="flex items-start justify-between gap-4"><div><h2 className="text-2xl font-bold text-slate-900">{subject}</h2><p className="mt-1 text-sm text-slate-500">{complete} of {subjectTopics.length} topics complete</p></div><button type="button" onClick={() => setExpandedSubject(expanded ? null : subject)} className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-indigo-100 hover:text-indigo-700" aria-label={expanded ? `Collapse ${subject}` : `Expand ${subject}`}>{expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}</button></div><div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${percent}%` }} /></div><p className="mt-2 text-right text-xs font-semibold text-indigo-700">{percent}%</p>{expanded && <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">{subjectTopics.map((topic) => { const done = topic.progress.status === "completed" || topic.progress.status === "revised"; return <button key={topic.id} type="button" onClick={() => updateProgress.mutate({ topicId: topic.id, status: done ? "inProgress" : "completed", completionPercentage: done ? 50 : 100 })} className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition ${done ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50 hover:border-indigo-300"}`}><CheckCircle2 className={`mt-0.5 h-5 w-5 shrink-0 ${done ? "text-emerald-600" : "text-slate-300"}`} /><span className="min-w-0"><span className={`block text-sm font-semibold ${done ? "text-emerald-800" : "text-slate-800"}`}>{topic.topic}</span><span className="mt-1 block text-xs text-slate-500">{topic.unit} · {topic.class === "jeeMain" ? "JEE Main" : topic.class === "jeeAdvanced" ? "JEE Advanced" : `Class ${topic.class}`}</span></span></button>; })}</div>}</div></section>; })}</div>}
      </div>
    </div>
  );
}
