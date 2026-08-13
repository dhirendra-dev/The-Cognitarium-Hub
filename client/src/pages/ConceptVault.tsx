import { useEffect, useMemo, useState } from "react";
import { Bookmark, BookmarkCheck, ChevronDown, ChevronUp, Lightbulb, Loader, Search, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";

const SAVED_KEY = "hslc-concept-vault-saved";

export default function ConceptVault() {
  const [subject, setSubject] = useState("all");
  const [search, setSearch] = useState("");
  const [savedOnly, setSavedOnly] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const syllabusQuery = trpc.syllabus.list.useQuery(undefined);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
      if (Array.isArray(stored)) setSavedIds(stored.filter((value): value is number => typeof value === "number"));
    } catch {
      setSavedIds([]);
    }
  }, []);

  const topics = syllabusQuery.data ?? [];
  const subjects = useMemo(() => Array.from(new Set(topics.map((topic) => topic.subject))).sort(), [topics]);
  const filteredTopics = useMemo(() => {
    const term = search.trim().toLowerCase();
    return topics.filter((topic) => {
      const matchesSubject = subject === "all" || topic.subject === subject;
      const matchesSaved = !savedOnly || savedIds.includes(topic.id);
      const haystack = [topic.subject, topic.unit, topic.topic, topic.subtopic, topic.conceptsRequired].filter(Boolean).join(" ").toLowerCase();
      return matchesSubject && matchesSaved && (!term || haystack.includes(term));
    });
  }, [savedIds, savedOnly, search, subject, topics]);

  const toggleSaved = (id: number) => {
    setSavedIds((previous) => {
      const next = previous.includes(id) ? previous.filter((value) => value !== id) : [...previous, id];
      localStorage.setItem(SAVED_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 p-6 text-white shadow-xl md:p-8">
          <div className="flex items-center gap-3">
            <Lightbulb className="h-9 w-9 text-yellow-100" aria-hidden="true" />
            <div>
              <h1 className="text-3xl font-bold">Concept Vault</h1>
              <p className="mt-1 text-orange-50">Search the active PCM syllabus and save the ideas you need to revisit.</p>
            </div>
          </div>
        </header>

        <section className="mb-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_auto_auto]">
          <label className="relative block">
            <span className="sr-only">Search concepts</span>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search subjects, units, topics, or prerequisites" className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200" />
          </label>
          <select value={subject} onChange={(event) => setSubject(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
            <option value="all">All subjects</option>
            {subjects.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <button type="button" onClick={() => setSavedOnly((value) => !value)} className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${savedOnly ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            {savedOnly ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />} Saved only
          </button>
        </section>

        {syllabusQuery.isLoading ? (
          <div className="flex items-center justify-center rounded-xl bg-white p-16 text-slate-500"><Loader className="mr-2 h-5 w-5 animate-spin" /> Loading concepts…</div>
        ) : syllabusQuery.isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">Could not load the Concept Vault. Please refresh and try again.</div>
        ) : filteredTopics.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
            <Sparkles className="mx-auto mb-4 h-10 w-10 text-orange-400" />
            <h2 className="text-xl font-semibold text-slate-800">No matching concepts</h2>
            <p className="mt-2 text-sm text-slate-500">Try another search or ask an admin to publish the PDF-defined syllabus topics.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredTopics.map((topic) => {
              const expanded = expandedId === topic.id;
              const saved = savedIds.includes(topic.id);
              return (
                <article key={topic.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
                  <div className="flex items-start justify-between gap-4 p-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">{topic.subject} · {topic.unit}</p>
                      <h2 className="mt-1 text-lg font-bold text-slate-900">{topic.topic}</h2>
                      <p className="mt-1 text-xs text-slate-500">{topic.class === "jeeMain" ? "JEE Main" : topic.class === "jeeAdvanced" ? "JEE Advanced" : `Class ${topic.class}`}{topic.subtopic ? ` · ${topic.subtopic}` : ""}</p>
                    </div>
                    <button type="button" onClick={() => toggleSaved(topic.id)} aria-label={saved ? "Remove from saved concepts" : "Save concept"} className={`rounded-lg p-2 ${saved ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-500 hover:bg-orange-50 hover:text-orange-600"}`}>
                      {saved ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                    </button>
                  </div>
                  <button type="button" onClick={() => setExpandedId(expanded ? null : topic.id)} className="flex w-full items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-orange-50">
                    <span>{expanded ? "Hide concept snapshot" : "Open concept snapshot"}</span>
                    {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  {expanded && (
                    <div className="space-y-4 border-t border-slate-100 p-5 text-sm text-slate-700">
                      <div>
                        <h3 className="mb-1 flex items-center gap-2 font-semibold text-orange-700"><Lightbulb className="h-4 w-4" /> Core concept / prerequisites</h3>
                        <p className="leading-relaxed">{topic.conceptsRequired || "Review the definitions, laws, and prerequisite ideas for this topic before attempting advanced problems."}</p>
                      </div>
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900">
                        <p className="font-semibold">Common trap check</p>
                        <p className="mt-1">State the governing condition, units, and limiting case before finalising your answer. Add a personal mistake note while revising.</p>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
