import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookMarked, Bookmark, CheckCircle2, ChevronRight, Filter, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function FormulaSheetsPage() {
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [search, setSearch] = useState("");
  const { data: sheets, isLoading } = trpc.formulaSheets.list.useQuery();
  const { data: bookmarks } = trpc.formulaSheets.bookmarks.useQuery();
  const utils = trpc.useUtils();
  const toggleBookmark = trpc.formulaSheets.toggleBookmark.useMutation({
    onSuccess: async (res) => {
      toast.success(res.bookmarked ? "Formula sheet bookmarked!" : "Bookmark removed.");
      await utils.formulaSheets.bookmarks.invalidate();
    },
  });

  const bookmarkedIds = new Set((bookmarks ?? []).map((b) => b.formulaSheetId));
  const filtered = (sheets ?? []).filter((sheet) => {
    if (selectedSubject !== "all" && sheet.subject.toLowerCase() !== selectedSubject.toLowerCase()) return false;
    if (search.trim() && !sheet.title.toLowerCase().includes(search.toLowerCase()) && !sheet.contentMarkdown.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-[1440px] space-y-7">
      <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />
        <div className="relative">
          <p className="ink-kicker mb-3">Quick revision desk</p>
          <h1 className="display-serif text-3xl font-bold tracking-tight sm:text-5xl">Formula Sheets & Key Shortcuts</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">High-yield revision cards for Physics, Chemistry, and Mathematics designed for last-minute JEE & board recall.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {["all", "Physics", "Chemistry", "Mathematics"].map((sub) => (
              <button key={sub} onClick={() => setSelectedSubject(sub)} className={`rounded-full px-5 py-2 text-sm font-bold capitalize transition-colors ${selectedSubject === sub ? "bg-primary text-primary-foreground" : "bg-muted/60 text-muted-foreground hover:bg-muted"}`}>
                {sub}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search formulas, theorems, shortcuts..." className="w-full rounded-full border border-border bg-card py-2.5 pl-10 pr-4 text-sm font-semibold outline-none focus:border-primary" />
        </div>
        <p className="text-sm font-bold text-muted-foreground">{filtered.length} formula sheets available</p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-muted-foreground">Loading formula sheets...</div>
      ) : filtered.length === 0 ? (
        <Card className="rounded-2xl border border-dashed border-border p-12 text-center">
          <BookMarked className="mx-auto h-10 w-10 text-primary opacity-60" />
          <h3 className="mt-4 text-lg font-bold">No formula sheets found</h3>
          <p className="mt-1 text-sm text-muted-foreground">Try adjusting your subject filter or search terms.</p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((sheet) => {
            const isBookmarked = bookmarkedIds.has(sheet.id);
            return (
              <Card key={sheet.id} className="elevated-card flex flex-col justify-between rounded-2xl p-6">
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="rounded-full bg-accent px-3 py-1 text-xs font-black text-primary">{sheet.subject}</span>
                    <button onClick={() => toggleBookmark.mutate({ formulaSheetId: sheet.id })} className={`rounded-full p-2 transition-colors ${isBookmarked ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}>
                      <Bookmark className="h-4 w-4" />
                    </button>
                  </div>
                  <h3 className="text-xl font-bold">{sheet.title}</h3>
                  <div className="mt-4 space-y-2 rounded-xl bg-muted/40 p-4 text-sm">
                    <p className="font-bold text-foreground">Key Formula / Takeaway:</p>
                    <p className="font-mono text-xs leading-relaxed text-muted-foreground">{sheet.keyFormulas || sheet.contentMarkdown.slice(0, 180) + "..."}</p>
                  </div>
                  {sheet.shortcuts && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-xs font-semibold text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                      <Sparkles className="h-4 w-4 shrink-0 text-amber-600" />
                      <span>Shortcut: {sheet.shortcuts}</span>
                    </div>
                  )}
                </div>
                <div className="mt-6 border-t border-border/60 pt-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{sheet.difficulty} difficulty</span>
                  <Button size="sm" onClick={() => toast.info(`Viewing ${sheet.title}`)} className="rounded-full">Read sheet</Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
