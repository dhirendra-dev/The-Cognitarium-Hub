import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, Moon, Sun, ShieldCheck, Sparkles, User, Bell, Layout } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";

export default function Settings() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dailyGoal, setDailyGoal] = useState("4");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dailyReminderTime, setDailyReminderTime] = useState("08:00");
  const [dashboardLayout, setDashboardLayout] = useState("grid");

  const { data: preferences } = trpc.preferences.get.useQuery();
  const updatePreferencesMutation = trpc.preferences.update.useMutation({
    onSuccess: () => {
      toast.success("Settings saved successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save settings");
    },
  });

  useEffect(() => {
    if (preferences) {
      setNotificationsEnabled(preferences.notificationsEnabled ?? true);
      setDailyReminderTime(preferences.dailyReminderTime || "08:00");
      setDashboardLayout(preferences.dashboardLayout || "grid");
    }
  }, [preferences]);

  const handleSaveSettings = async () => {
    updatePreferencesMutation.mutate({
      notificationsEnabled,
      dailyReminderTime,
      dashboardLayout,
    });
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-8 pb-12">
      <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-accent/30 blur-3xl pointer-events-none" />
        <div className="relative">
          <p className="ink-kicker flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> Workspace customization</p>
          <h1 className="display-serif mt-3 text-3xl font-bold tracking-tight sm:text-5xl">Study Settings</h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">Manage your profile credentials, notification schedules, and command center display preferences.</p>
        </div>
      </section>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="elevated-card rounded-[1.75rem] p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-border/60 pb-4">
            <span className="rounded-xl bg-primary/10 p-2.5 text-primary"><User className="h-5 w-5" /></span>
            <div>
              <p className="ink-kicker">Account</p>
              <h2 className="text-xl font-black">Profile Information</h2>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Full Name</Label>
              <p className="mt-1 text-base font-bold text-foreground">{user?.name || "Dhirendra Kumar"}</p>
            </div>
            <div>
              <Label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Email Address</Label>
              <p className="mt-1 text-base font-bold text-foreground">{user?.email || "dhirendraofficial0@gmail.com"}</p>
            </div>
            <div>
              <Label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Role & Access</Label>
              <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary uppercase">
                <ShieldCheck className="h-3.5 w-3.5" /> {user?.role || "user"}
              </p>
            </div>
            <div>
              <Label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Member Since</Label>
              <p className="mt-1 text-sm font-semibold text-muted-foreground">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "August 2026"}
              </p>
            </div>
          </div>
        </Card>

        <Card className="elevated-card rounded-[1.75rem] p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-border/60 pb-4">
            <span className="rounded-xl bg-primary/10 p-2.5 text-primary"><SettingsIcon className="h-5 w-5" /></span>
            <div>
              <p className="ink-kicker">Daily Targets</p>
              <h2 className="text-xl font-black">Study Goals</h2>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="daily-goal" className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                Daily Study Goal (Hours)
              </Label>
              <Input
                id="daily-goal"
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(e.target.value)}
                className="mt-2 h-12 rounded-xl bg-background font-semibold"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Set a consistent target to drive streak milestones and XP rewards.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="elevated-card rounded-[1.75rem] p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-border/60 pb-4">
          <span className="rounded-xl bg-primary/10 p-2.5 text-primary"><Bell className="h-5 w-5" /></span>
          <div>
            <p className="ink-kicker">Reminders & Alerts</p>
            <h2 className="text-xl font-black">Notifications & Display</h2>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/50 p-5">
            <div>
              <Label className="text-sm font-black">Enable Notifications</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Receive daily study reminders and alerts</p>
            </div>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/50 p-5">
            <div>
              <Label className="text-sm font-black">Interface Theme</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Switch between light and dark notebook mode</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="rounded-full gap-2 font-bold"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 pt-2">
          <div>
            <Label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Daily Reminder Time</Label>
            <Input
              type="time"
              value={dailyReminderTime}
              onChange={(e) => setDailyReminderTime(e.target.value)}
              className="mt-2 h-12 rounded-xl bg-background font-semibold"
            />
          </div>

          <div>
            <Label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Command Center Layout</Label>
            <select
              value={dashboardLayout}
              onChange={(e) => setDashboardLayout(e.target.value)}
              className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold outline-none focus:border-primary"
            >
              <option value="grid">Standard Grid</option>
              <option value="compact">Compact View</option>
              <option value="focus">Focus Mode</option>
            </select>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button
            onClick={handleSaveSettings}
            disabled={updatePreferencesMutation.isPending}
            className="h-12 px-8 rounded-full font-bold"
          >
            {updatePreferencesMutation.isPending ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
