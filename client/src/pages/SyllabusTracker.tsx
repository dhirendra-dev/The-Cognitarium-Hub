import React, { useState, useMemo } from "react";
import { BookOpen, CheckCircle2, Filter, Loader, RefreshCw, Layers, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const EXAM_FILTERS = [
  { value: "all", label: "All Exam Tracks" },
  { value: "jeeMain", label: "JEE Main 2025" },
  { value: "jeeAdvanced", label: "JEE Advanced" },
  { value: "neet", label: "NEET 2025 (Biology)" },
  { value: "11", label: "Class 11 Foundation" },
  { value: "12", label: "Class 12 Core" },
] as const;

export default function SyllabusTracker() {
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [examFilter, setExamFilter] = useState<(typeof EXAM_FILTERS)[number]["value"]>("all");
  const utils = trpc.useUtils();

  const queryInput = useMemo(
    () => ({
      ...(subjectFilter !== "all" ? { subject: subjectFilter } : {}),
      ...(examFilter !== "all" ? { exam: examFilter } : {}),
    }),
    [examFilter, subjectFilter]
  );

  const syllabusQuery = trpc.syllabus.list.useQuery(queryInput);
  const syncMutation = trpc.syllabus.syncNtaSyllabus.useMutation({
    onSuccess: async (data) => {
      await utils.syllabus.list.invalidate();
      toast.success(`Successfully synchronized ${data.count} official NTA 2025 syllabus topics!`);
    },
    onError: (error) => toast.error(error.message || "Could not sync official syllabus."),
  });

  const updateProgress = trpc.syllabus.updateProgress.useMutation({
    onSuccess: async () => {
      await utils.syllabus.list.invalidate();
      toast.success("Progress updated successfully.");
    },
    onError: (error) => toast.error(error.message || "Could not save progress."),
  });

  const topics = syllabusQuery.data ?? [];
  const subjects = useMemo(
    () => Array.from(new Set(topics.map((topic) => topic.subject))).sort(),
    [topics]
  );

  const groupedByUnit = useMemo(() => {
    const result = new Map<string, typeof topics>();
    for (const topic of topics) {
      const key = `${topic.subject} :: ${topic.unit}`;
      if (!result.has(key)) result.set(key, []);
      result.get(key)!.push(topic);
    }
    return result;
  }, [topics]);

  const completedCount = topics.filter((topic) => topic.progress.status === "completed" || topic.progress.status === "revised").length;
  const progressPercent = topics.length ? Math.round((completedCount / topics.length) * 100) : 0;

  const toggleTopic = (topic: (typeof topics)[number]) => {
    const isDone = topic.progress.status === "completed" || topic.progress.status === "revised";
    updateProgress.mutate({
      topicId: topic.id,
      status: isDone ? "inProgress" : "completed",
      completionPercentage: isDone ? 50 : 100,
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C221E] p-4 md:p-8 font-sans">
      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* Header Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2D2420] via-[#3E322C] to-[#1E1815] p-6 text-[#FDFBF7] shadow-2xl md:p-10 border border-[#4E4038]">
          <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3.5 py-1 text-xs font-medium text-amber-300 border border-amber-500/30">
                <ShieldCheck className="h-3.5 w-3.5" /> Official 2025 NTA Syllabus Map
              </div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-white">
                The Cognitarium Syllabus Map
              </h1>
              <p className="max-w-2xl text-sm md:text-base text-stone-300 leading-relaxed font-light">
                Authoritative JEE Main, JEE Advanced, and NEET 2025 curriculum tracker. Monitor your topic mastery, weightage distribution, and concept readiness across all chapters.
              </p>
            </div>
            
            <div className="flex flex-col items-start md:items-end gap-3">
              <button
                onClick={() => syncMutation.mutate()}
                disabled={syncMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 px-5 py-2.5 text-sm font-semibold shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${syncMutation.isPending ? "animate-spin" : ""}`} />
                {syncMutation.isPending ? "Syncing NTA Data..." : "Sync 2025 NTA Syllabus"}
              </button>
              
              <div className="w-full md:w-64 rounded-2xl bg-white/10 backdrop-blur-md p-4 border border-white/10 shadow-inner">
                <div className="flex justify-between items-center text-xs text-stone-300 mb-1">
                  <span>Overall Mastery</span>
                  <span className="font-bold text-amber-300">{progressPercent}%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/20">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-200 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="mt-2 text-right text-[11px] text-stone-400">
                  {completedCount} of {topics.length} topics mastered
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500">
              <Filter className="h-4 w-4 text-amber-700" /> Filter View:
            </div>
            
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="rounded-xl border border-stone-300 bg-stone-50 px-3.5 py-2 text-sm font-medium text-stone-800 focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
            >
              <option value="all">All Subjects</option>
              {subjects.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>

            <select
              value={examFilter}
              onChange={(e) => setExamFilter(e.target.value as any)}
              className="rounded-xl border border-stone-300 bg-stone-50 px-3.5 py-2 text-sm font-medium text-stone-800 focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
            >
              {EXAM_FILTERS.map((ef) => (
                <option key={ef.value} value={ef.value}>{ef.label}</option>
              ))}
            </select>
          </div>

          <div className="text-xs font-medium text-stone-500">
            {syllabusQuery.isFetching ? "Refreshing database…" : `${topics.length} topics loaded`}
          </div>
        </div>

        {/* Content Area */}
        {syllabusQuery.isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-stone-200 bg-white p-20 text-stone-500 shadow-sm">
            <Loader className="h-8 w-8 animate-spin text-amber-700 mb-3" />
            <p className="text-sm font-medium">Loading official 2025 curriculum map…</p>
          </div>
        ) : syllabusQuery.isError ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800 text-center">
            <p className="font-semibold">Could not load syllabus database.</p>
            <p className="text-xs mt-1">Please verify connection or click Sync 2025 NTA Syllabus above.</p>
          </div>
        ) : topics.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-16 text-center shadow-sm">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-stone-400" />
            <h2 className="text-xl font-serif font-bold text-stone-800">No syllabus topics found</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-stone-600">
              The syllabus table is currently empty. Click the button below to instantly ingest the official 2025 JEE Main, JEE Advanced, and NEET curriculum.
            </p>
            <button
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white px-6 py-3 text-sm font-semibold shadow-md transition-all"
            >
              <Sparkles className="h-4 w-4" /> Ingest Official 2025 NTA Syllabus Now
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {Array.from(groupedByUnit.entries()).map(([unitKey, unitTopics]) => {
              const [subjectName, unitName] = unitKey.split(" :: ");
              return (
                <div key={unitKey} className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-3 gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="rounded-xl bg-amber-100 p-2 text-amber-800">
                        <Layers className="h-4 w-4" />
                      </span>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-700">{subjectName}</span>
                        <h2 className="text-lg font-serif font-bold text-stone-900">{unitName}</h2>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-stone-500 bg-stone-100 px-3 py-1 rounded-full w-fit">
                      {unitTopics.length} topic{unitTopics.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {unitTopics.map((topic) => {
                      const isCompleted = topic.progress.status === "completed" || topic.progress.status === "revised";
                      return (
                        <div
                          key={topic.id}
                          onClick={() => toggleTopic(topic)}
                          className={`group relative flex flex-col justify-between rounded-2xl border p-4.5 transition-all cursor-pointer ${
                            isCompleted
                              ? "border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50/70"
                              : "border-stone-200 bg-stone-50/60 hover:bg-stone-50 hover:border-amber-300"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-md bg-stone-200/70 text-stone-700">
                                  {topic.class}
                                </span>
                                {topic.weightage && (
                                  <span className="text-[11px] font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md">
                                    Weight: {topic.weightage}%
                                  </span>
                                )}
                              </div>
                              <h3 className="text-base font-bold text-stone-900 group-hover:text-amber-900 transition-colors">
                                {topic.topic}
                              </h3>
                              {topic.subtopic && (
                                <p className="text-xs text-stone-600 leading-relaxed">
                                  {topic.subtopic}
                                </p>
                              )}
                            </div>

                            <button
                              type="button"
                              className={`h-7 w-7 rounded-full flex items-center justify-center transition-all ${
                                isCompleted
                                  ? "bg-emerald-600 text-white shadow-sm"
                                  : "border-2 border-stone-300 bg-white text-transparent group-hover:border-amber-600"
                              }`}
                              aria-label="Toggle completion"
                            >
                              <CheckCircle2 className={`h-4 w-4 ${isCompleted ? "opacity-100" : "opacity-0"}`} />
                            </button>
                          </div>

                          {topic.conceptsRequired && (
                            <div className="mt-4 flex items-center gap-1.5 text-[11px] text-stone-500 border-t border-stone-200/60 pt-2.5">
                              <span className="font-semibold text-stone-700">Concepts:</span>
                              <span className="truncate">{topic.conceptsRequired}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
