import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Flame, Award } from "lucide-react";
import { useState } from "react";
import ComparisonView from "@/components/ComparisonView";
import { useAuth } from "@/hooks/useAuth";

export default function Leaderboard() {
  const { user } = useAuth();
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null);
  const { data: topUsers } = trpc.leaderboard.getTop.useQuery({ limit: 50 });
  const { data: userRank } = trpc.leaderboard.getUserRank.useQuery();
  const { data: allToppers = [] } = trpc.toppers.getToppers.useQuery();

  const filteredToppers = selectedBoard
    ? allToppers.filter((t: any) => t.board === selectedBoard)
    : allToppers;

  const boards = Array.from(new Set(allToppers.map((t: any) => t.board))).sort();

  const getMedalIcon = (position: number) => {
    if (position === 1) return <Trophy className="h-6 w-6 text-amber-500" />;
    if (position === 2) return <Medal className="h-6 w-6 text-slate-400" />;
    if (position === 3) return <Medal className="h-6 w-6 text-amber-700" />;
    return null;
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-8 animate-in fade-in duration-300">
      <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-accent/30 blur-3xl pointer-events-none" />
        <div className="relative">
          <p className="ink-kicker mb-3">Excellence & Recognition</p>
          <h1 className="display-serif text-3xl font-bold tracking-tight sm:text-5xl">Community Leaderboard</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">Compare your XP and engagement progress with top-performing peers across India.</p>
        </div>
      </section>

      {userRank && (
        <Card className="elevated-card rounded-[2rem] p-6 sm:p-8 bg-primary text-primary-foreground shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-1">
              <p className="text-xs font-black uppercase tracking-wider text-primary-foreground/75">Your Standing</p>
              <h2 className="text-4xl font-black">Rank #{userRank.rank || "—"}</h2>
            </div>
            <div className="flex items-center gap-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary-foreground/75">Total XP</p>
                <p className="text-3xl font-black mt-1">{userRank.points || 0}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary-foreground/75">Streak</p>
                <div className="flex items-center gap-2 mt-1">
                  <Flame className="h-6 w-6 text-accent" />
                  <p className="text-3xl font-black">{(userRank as any).currentStreak || 0} d</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="elevated-card rounded-[2rem] p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <p className="ink-kicker">Top 50 Performers</p>
              <h2 className="text-2xl font-bold tracking-tight">Platform Leaderboard</h2>
            </div>
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          {!topUsers || topUsers.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Award className="mx-auto h-10 w-10 text-muted-foreground/60" />
              <p className="text-sm font-bold text-muted-foreground">No leaderboard records yet. Start earning XP to rank up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topUsers.map((u: any, idx: number) => (
                <div key={u.id} className="flex items-center gap-4 rounded-2xl border border-border/70 bg-background/50 p-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted font-black text-sm text-foreground">
                    {getMedalIcon(idx + 1) || `#${idx + 1}`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground truncate">{u.name || "Student"}</p>
                    <p className="text-xs font-semibold text-muted-foreground">Level {Math.floor((u.points || 0) / 500) + 1}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-primary">{u.points || 0} XP</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="elevated-card rounded-[2rem] p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <p className="ink-kicker">Honor Roll</p>
              <h2 className="text-2xl font-bold tracking-tight">Community Toppers</h2>
            </div>
            <Medal className="h-6 w-6 text-primary" />
          </div>

          {boards.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedBoard(null)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${!selectedBoard ? "bg-primary text-primary-foreground shadow-xs" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
              >
                All Boards
              </button>
              {boards.map((b: any) => (
                <button
                  key={b}
                  onClick={() => setSelectedBoard(b)}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${selectedBoard === b ? "bg-primary text-primary-foreground shadow-xs" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                >
                  {b}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {filteredToppers.slice(0, 20).map((topper: any) => (
              <div key={topper.id} className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/50 p-4">
                <div>
                  <p className="font-bold text-foreground">{topper.name}</p>
                  <p className="text-xs font-semibold text-muted-foreground">{topper.board} · {topper.stream}</p>
                </div>
                <div className="text-right">
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-700 dark:text-emerald-300">{topper.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="pt-4">
        <ComparisonView />
      </div>
    </div>
  );
}
