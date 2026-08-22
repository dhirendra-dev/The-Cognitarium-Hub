import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, Search, Filter, BookOpen } from "lucide-react";
import { trpc } from "@/lib/trpc";

const CATEGORIES = [
  "PW Modules",
  "Cengage Series",
  "Coaching Materials",
  "Physics Resources",
  "Chemistry Resources",
  "Mathematics Resources",
  "Previous Year Questions",
  "Mock Tests",
];

const SUBJECTS = ["Physics", "Chemistry", "Mathematics"];

export default function StudyMaterialsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const { data: allMaterials = [] } = trpc.studyMaterials.getAll.useQuery();
  const { data: popularMaterials = [] } = trpc.studyMaterials.getPopular.useQuery();

  const filteredMaterials = useMemo(() => {
    return allMaterials.filter((material) => {
      const matchesSearch =
        material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.author?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = !selectedCategory || material.category === selectedCategory;
      const matchesSubject = !selectedSubject || material.subject === selectedSubject;

      return matchesSearch && matchesCategory && matchesSubject;
    });
  }, [allMaterials, searchQuery, selectedCategory, selectedSubject]);

  return (
    <div className="mx-auto max-w-[1440px] space-y-8 animate-in fade-in duration-300">
      <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-accent/30 blur-3xl pointer-events-none" />
        <div className="relative">
          <p className="ink-kicker mb-3">Curated Resource Library</p>
          <h1 className="display-serif text-3xl font-bold tracking-tight sm:text-5xl">Study Materials</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">Access comprehensive JEE preparation resources curated from top coaching institutes and expert faculty.</p>
        </div>
      </section>

      <Card className="elevated-card rounded-[2rem] p-6 sm:p-8 space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search materials by title, author, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-border bg-background pl-12 pr-4 py-3 text-sm font-semibold text-foreground focus:outline-primary"
          />
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-3">Filter by Category</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${!selectedCategory ? "bg-primary text-primary-foreground shadow-xs" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
              >
                All Categories
              </button>
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${selectedCategory === category ? "bg-primary text-primary-foreground shadow-xs" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-3">Filter by Subject</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSubject(null)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${!selectedSubject ? "bg-primary text-primary-foreground shadow-xs" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
              >
                All Subjects
              </button>
              {SUBJECTS.map((subject) => (
                <button
                  key={subject}
                  onClick={() => setSelectedSubject(subject)}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${selectedSubject === subject ? "bg-primary text-primary-foreground shadow-xs" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Available Resources ({filteredMaterials.length})</h2>
        {filteredMaterials.length === 0 ? (
          <Card className="rounded-[2rem] p-12 text-center space-y-3 border border-dashed border-border bg-card">
            <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/60" />
            <p className="text-base font-bold text-foreground">No study materials found</p>
            <p className="text-sm font-semibold text-muted-foreground">Try adjusting your search query or filter selection.</p>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredMaterials.map((material) => (
              <Card key={material.id} className="elevated-card rounded-[1.75rem] p-6 flex flex-col justify-between space-y-4 border border-border bg-card hover:border-primary/50 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase text-primary">{material.subject}</span>
                    <span className="text-xs font-bold text-muted-foreground">{material.category}</span>
                  </div>
                  <h3 className="text-lg font-bold tracking-tight text-foreground">{material.title}</h3>
                  <p className="text-xs font-semibold text-muted-foreground line-clamp-2">{material.description || "Curated study resource for deep conceptual mastery."}</p>
                </div>
                <div className="pt-4 border-t border-border/60 flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground">Author: {material.author || "Expert Faculty"}</span>
                  {material.url && (
                    <Button asChild size="sm" className="rounded-full px-4 font-bold">
                      <a href={material.url} target="_blank" rel="noopener noreferrer">
                        Access <ExternalLink className="ml-1.5 h-3 w-3" />
                      </a>
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
