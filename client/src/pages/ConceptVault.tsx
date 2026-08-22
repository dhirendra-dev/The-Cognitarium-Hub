import { useState, useMemo, useEffect } from "react";
import { Bookmark, BookmarkCheck, ChevronDown, ChevronUp, Lightbulb, Loader, Search, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    <div className="mx-auto max-w-[1440px] space-y-8 animate-in fade-in duration-300">
      <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-accent/30 blur-3xl pointer-events-none" />
        <div className="relative">
          <p className="ink-kicker mb-3">Conceptual Reference</p>
          <h1 className="display-serif text-3xl font-bold tracking-tight sm:text-5xl">Concept Vault</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">Search the active PCM syllabus and save the fundamental ideas, derivations, and formulas you need to revisit.</p>
        </div>
      </section>

      <Card className="elevated-card rounded-[2rem] p-6 sm:p-8 space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subjects, units, topics, or formulas..."
              className="w-full rounded-2xl border border-border bg-background pl-12 pr-4 py-3 text-sm font-semibold text-foreground focus:outline-primary"
            />
          </div>
          <div>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground"
            >
              <option value="all">All Subjects</option>
              {subjects.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button
            variant={savedOnly ? "default" : "outline"}
            onClick={() => setSavedOnly((v) => !v)}
            className="rounded-full px-5 font-bold gap-2"
          >
            {savedOnly ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            {savedOnly ? "Showing Saved Only" : "Show Saved Only"}
          </Button>
          <span className="text-xs font-bold text-muted-foreground">Found {filteredTopics.length} concepts</span>
        </div>
      </Card>

      {syllabusQuery.isLoading ? (
        <div className="flex items-center justify-center rounded-[2rem] bg-card p-16 text-muted-foreground border border-border">
          <Loader className="mr-3 h-5 w-5 animate-spin text-primary" /> Loading concept database...
        </div>
      ) : filteredTopics.length === 0 ? (
        <Card className="rounded-[2rem] p-12 text-center space-y-3 border border-dashed border-border bg-card">
          <Lightbulb className="mx-auto h-10 w-10 text-muted-foreground/60" />
          <p className="text-base font-bold text-foreground">No matching concepts</p>
          <p className="text-sm font-semibold text-muted-foreground">Try adjusting your search terms or filter criteria.</p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTopics.map((topic) => {
            const isSaved = savedIds.includes(topic.id);
            const isExpanded = expandedId === topic.id;
            return (
              <Card key={topic.id} className="elevated-card rounded-[1.75rem] p-6 flex flex-col justify-between space-y-4 border border-border bg-card">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase text-primary">{topic.subject}</span>
                    <button
                      onClick={() => toggleSaved(topic.id)}
                      className={`rounded-full p-2 transition-colors ${isSaved ? "bg-amber-500/10 text-amber-600" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                      title={isSaved ? "Saved to vault" : "Save concept"}
                    >
                      {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                    </button>
                  </div>
                  <h3 className="text-lg font-bold tracking-tight text-foreground">{topic.topic}</h3>
                  <p className="text-xs font-semibold text-muted-foreground">{topic.unit} {topic.subtopic ? `· ${topic.subtopic}` : ""}</p>
                </div>

                <div className="pt-4 border-t border-border/60 space-y-3">
                  {topic.conceptsRequired && (
                    <p className="text-xs font-semibold text-foreground/90 bg-muted/40 p-3 rounded-xl border border-border/50">
                      {topic.conceptsRequired}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-[0.65rem] font-black uppercase text-muted-foreground">Class: {topic.class || "JEE Main"}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setExpandedId(isExpanded ? null : topic.id)}
                      className="rounded-full text-xs font-bold gap-1"
                    >
                      {isExpanded ? "Hide notes" : "Quick review"}
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                  {isExpanded && (
                    <div className="rounded-xl bg-background p-4 text-xs font-semibold text-muted-foreground space-y-2 border border-border/80 animate-in fade-in">
                      <p><strong className="text-foreground">Exam Weight:</strong> High priority for JEE Main / Advanced.</p>
                      <p><strong className="text-foreground">Recommended Action:</strong> Solve at least 15 timed PYQs from this chapter.</p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
