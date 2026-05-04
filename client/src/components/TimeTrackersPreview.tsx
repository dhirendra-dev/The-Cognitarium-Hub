import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, TrendingUp, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/useAuth";

export function TimeTrackersPreview() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  
  const { data: allSessions, isLoading: sessionsLoading } = trpc.studySessions.getByUser.useQuery(
    { daysBack: 30 },
    { enabled: !!user?.id }
  );

  const { data: timerSessions, isLoading: timerLoading } = trpc.studyTimer.getSessions.useQuery(
    { date: new Date() },
    { enabled: !!user?.id }
  );

  const isLoading = sessionsLoading || timerLoading;

  if (!user) {
    return (
      <Card className="border-purple-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            <CardTitle>Time Trackers</CardTitle>
          </div>
          <CardDescription>Track your study sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 text-center py-6">
            Sign in to view your study time trackers
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
      </div>
    );
  }

  const totalSessions = (allSessions?.length || 0) + (timerSessions?.length || 0);
  const totalHours = (allSessions || []).reduce((sum: number, session: any) => {
    return sum + parseFloat(session.hoursStudied?.toString() || "0");
  }, 0);

  const recentSessions = [
    ...(allSessions?.slice(0, 3) || []).map((s: any) => ({
      type: "session",
      date: s.date,
      subject: s.subject || "General",
      hours: parseFloat(s.hoursStudied?.toString() || "0")
    })),
    ...(timerSessions?.slice(0, 3) || []).map(t => ({
      type: "timer",
      date: t.startTime,
      subject: t.subject || "General",
      hours: (t.duration || 0) / 60
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);

  return (
    <Card className="border-purple-200 hover:shadow-lg transition">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            <CardTitle>Time Trackers</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/daily-tasks")}
            className="text-purple-600 hover:text-purple-700"
          >
            View All →
          </Button>
        </div>
        <CardDescription>Your recent study sessions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-100">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-semibold text-gray-600">Total Hours</span>
              </div>
              <p className="text-2xl font-bold text-purple-700">
                {totalHours.toFixed(1)}h
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg border border-indigo-100">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-semibold text-gray-600">Sessions</span>
              </div>
              <p className="text-2xl font-bold text-indigo-700">
                {totalSessions}
              </p>
            </div>
          </div>

          {/* Recent Sessions */}
          {recentSessions.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-600 uppercase">Recent Activity</p>
              {recentSessions.map((session, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-gray-50 rounded border border-gray-200 flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{session.subject}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(session.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-purple-600">
                    {session.hours.toFixed(1)}h
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4 text-sm">
              No study sessions yet. Start tracking!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
