import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Bell,
  BookOpen,
  BookMarked,
  BrainCircuit,
  CalendarDays,
  ChevronRight,
  CircleHelp,
  FileText,
  Flame,
  Gauge,
  Image,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Menu,
  MessageCircle,
  Settings,
  Shield,
  Sparkles,
  Swords,
  Target,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";

const navGroups = [
  {
    label: "Focus",
    items: [
      { label: "Overview", path: "/dashboard", icon: LayoutDashboard },
      { label: "Syllabus map", path: "/syllabus", icon: BookMarked },
      { label: "Daily plan", path: "/daily-tasks", icon: CalendarDays },
    ],
  },
  {
    label: "Practice",
    items: [
      { label: "Practice lab", path: "/dpp-generator", icon: Swords },
      { label: "CBT review", path: "/cbt-review", icon: Gauge },
      { label: "Concept vault", path: "/concept-vault", icon: Lightbulb },
      { label: "Chat coach", path: "/chat-coach", icon: MessageCircle },
      { label: "Doubt desk", path: "/doubts", icon: CircleHelp },
      { label: "Community hub", path: "/community", icon: Users },
      { label: "Study library", path: "/study-materials", icon: BookOpen },
    ],
  },
  {
    label: "Accountability",
    items: [
      { label: "Squads", path: "/squads", icon: Users },
      { label: "Leaderboard", path: "/leaderboard", icon: Trophy },
      { label: "Certificates", path: "/certificates", icon: Sparkles },
    ],
  },
];

const utilityItems = [
  { label: "Progress analytics", path: "/analytics", icon: BarChart3 },
  { label: "Image studio", path: "/image-generator", icon: Image },
  { label: "Settings", path: "/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading, user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) setLocation("/contact");
  }, [loading, user, setLocation]);

  if (loading || !user) return <DashboardLayoutSkeleton />;

  const initials = (user.name || user.email || "S").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const activeLabel = useMemo(() => {
    const allItems = [...navGroups.flatMap((group) => group.items), ...utilityItems];
    return allItems.find((item) => location === item.path || location.startsWith(`${item.path}/`))?.label ?? "Overview";
  }, [location]);

  const go = (path: string) => {
    setLocation(path);
    setMobileOpen(false);
  };

  const navigation = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-sidebar-border px-6 py-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-black/10">
          <BrainCircuit className="h-6 w-6" />
        </div>
        <div>
          <p className="font-black tracking-tight text-sidebar-foreground">Prep / Hub</p>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/55">adaptive learning</p>
        </div>
        <span className="ml-auto h-2 w-2 rounded-full bg-emerald-400" title="Systems online" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-7">
            <p className="mb-2 px-3 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-sidebar-foreground/40">{group.label}</p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path || location.startsWith(`${item.path}/`);
                return (
                  <button
                    key={item.path}
                    onClick={() => go(item.path)}
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-all focus-ring ${isActive ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" : "text-sidebar-foreground/68 hover:bg-sidebar-accent/65 hover:text-sidebar-foreground"}`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-primary"}`} />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="h-3.5 w-3.5 text-sidebar-primary" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div>
          <p className="mb-2 px-3 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-sidebar-foreground/40">Tools</p>
          <div className="space-y-1">
            {utilityItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path || location.startsWith(`${item.path}/`);
              return (
                <button key={item.path} onClick={() => go(item.path)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-all focus-ring ${isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/68 hover:bg-sidebar-accent/65 hover:text-sidebar-foreground"}`}>
                  <Icon className={`h-4 w-4 ${isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
            {user.role === "admin" && (
              <button onClick={() => go("/admin")} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-all focus-ring ${location.startsWith("/admin") ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/68 hover:bg-sidebar-accent/65 hover:text-sidebar-foreground"}`}>
                <Shield className="h-4 w-4 text-sidebar-primary" />
                <span>Admin console</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-sidebar-border p-4">
        <div className="mb-3 rounded-2xl bg-sidebar-accent/55 p-3">
          <div className="mb-2 flex items-center justify-between text-xs text-sidebar-foreground/60"><span>Daily focus</span><Target className="h-3.5 w-3.5 text-sidebar-primary" /></div>
          <div className="mb-1.5 h-1.5 overflow-hidden rounded-full bg-black/20"><div className="h-full w-[62%] rounded-full bg-sidebar-primary" /></div>
          <p className="text-xs font-semibold text-sidebar-foreground/80">62% of today’s plan</p>
        </div>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-ring">
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[276px] bg-sidebar lg:block">{navigation}</aside>
      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[min(86vw,320px)] bg-sidebar shadow-2xl transition-transform duration-200 lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-end px-4 pt-4"><Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} className="text-sidebar-foreground hover:bg-sidebar-accent"><X className="h-5 w-5" /></Button></div>
        {navigation}
      </aside>

      <div className="lg:pl-[276px]">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-border/70 bg-background/88 px-4 backdrop-blur-xl sm:px-7 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} className="lg:hidden"><Menu className="h-5 w-5" /></Button>
            <div className="min-w-0">
              <p className="ink-kicker hidden sm:block">Student command center</p>
              <h1 className="truncate text-lg font-black tracking-tight sm:text-xl">{activeLabel}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-bold text-muted-foreground sm:flex"><CircleHelp className="h-3.5 w-3.5 text-primary" /> Need a nudge?</div>
            <button onClick={() => go("/daily-tasks")} className="hidden items-center gap-2 rounded-full bg-accent/50 px-3 py-2 text-xs font-black text-accent-foreground transition-transform hover:-translate-y-0.5 sm:flex"><Flame className="h-4 w-4 text-primary" /> Keep your streak</button>
            <button onClick={() => go("/settings")} className="focus-ring rounded-full"><Avatar className="h-10 w-10 border-2 border-card shadow-sm"><AvatarFallback className="bg-primary text-xs font-black text-primary-foreground">{initials}</AvatarFallback></Avatar></button>
          </div>
        </header>
        <main className="dashboard-surface paper-grid min-h-[calc(100vh-76px)] p-4 sm:p-7 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
