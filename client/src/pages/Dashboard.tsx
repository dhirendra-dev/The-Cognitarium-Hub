import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Clock, BookOpen, Target, TrendingUp, Plus } from "lucide-react";
import { toast } from "sonner";

const EXAM_DATE = new Date("2026-02-10");

interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [countdown, setCountdown] = useState<CountdownState>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [hoursStudied, setHoursStudied] = useState("");
  const [subject, setSubject] = useState("");
  const [notes, setNotes] = useState("");
  const [showForm, setShowForm] = useState(false);

  // tRPC queries and mutations
  const { data: studySessions, refetch: refetchSessions } = trpc.studySessions.getByUser.useQuery({ daysBack: 30 });
  const { data: totalHours } = trpc.studySessions.getTotalHours.useQuery({ daysBack: 30 });
  const createSessionMutation = trpc.studySessions.create.useMutation({
    onSuccess: () => {
      toast.success("Study session logged successfully!");
      setHoursStudied("");
      setSubject("");
      setNotes("");
      setShowForm(false);
      refetchSessions();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to log study session");
    },
  });

  // Countdown timer effect
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const diff = EXAM_DATE.getTime() - now.getTime();

      if (diff > 0) {
        setCountdown({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hoursStudied) {
      toast.error("Please enter hours studied");
      return;
    }

    createSessionMutation.mutate({
      date: new Date(),
      hoursStudied: parseFloat(hoursStudied),
      subject: subject || undefined,
      notes: notes || undefined,
    });
  };

  // Prepare chart data
  const chartData = (studySessions || [])
    .slice(-7)
    .map((session) => ({
      date: new Date(session.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      hours: parseFloat(session.hoursStudied as any),
    }));

  const motivationalMessages = [
    "Every hour of study brings you closer to success! 📚",
    "Your dedication today determines your tomorrow! 💪",
    "The exam is approaching - stay focused and consistent! 🎯",
    "You've got this! Keep pushing forward! 🚀",
    "Remember: small daily efforts lead to big results! ⭐",
  ];

  const currentMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome back, {user?.name}! 👋</h1>
          <p className="text-gray-600">{currentMessage}</p>
        </div>

        {/* Countdown Timer */}
        <Card className="mb-8 bg-white border-2 border-indigo-200 shadow-lg">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-8 h-8 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-800">Board Exam Countdown</h2>
            </div>
            <p className="text-gray-600 mb-6">February 10, 2026</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Days", value: countdown.days },
                { label: "Hours", value: countdown.hours },
                { label: "Minutes", value: countdown.minutes },
                { label: "Seconds", value: countdown.seconds },
              ].map((item) => (
                <div key={item.label} className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-6 text-white text-center">
                  <div className="text-4xl font-bold mb-2">{String(item.value).padStart(2, "0")}</div>
                  <div className="text-sm font-semibold">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Study Stats */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-lg mb-8">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-6 h-6 text-indigo-600" />
                  <h2 className="text-xl font-bold text-gray-800">Study Progress (Last 7 Days)</h2>
                </div>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="hours" stroke="#4f46e5" strokeWidth={2} dot={{ fill: "#4f46e5" }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <p>No study data yet. Start logging your study sessions!</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Study Statistics */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                <div className="p-6">
                  <BookOpen className="w-8 h-8 text-green-600 mb-3" />
                  <div className="text-3xl font-bold text-green-700 mb-1">{totalHours?.toFixed(1) || "0"}</div>
                  <div className="text-sm text-green-600 font-semibold">Hours Studied (30 days)</div>
                </div>
              </Card>
              <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200">
                <div className="p-6">
                  <Target className="w-8 h-8 text-orange-600 mb-3" />
                  <div className="text-3xl font-bold text-orange-700 mb-1">{(studySessions?.length || 0)}</div>
                  <div className="text-sm text-orange-600 font-semibold">Study Sessions</div>
                </div>
              </Card>
            </div>
          </div>

          {/* Log Study Session Form */}
          <Card className="bg-white shadow-lg h-fit sticky top-8">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Plus className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-800">Log Study Session</h2>
              </div>

              <form onSubmit={handleLogSession} className="space-y-4">
                <div>
                  <Label htmlFor="hours" className="text-sm font-semibold text-gray-700">
                    Hours Studied
                  </Label>
                  <Input
                    id="hours"
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={hoursStudied}
                    onChange={(e) => setHoursStudied(e.target.value)}
                    placeholder="e.g., 2.5"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="subject" className="text-sm font-semibold text-gray-700">
                    Subject (Optional)
                  </Label>
                  <Input
                    id="subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Mathematics"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">
                    Notes (Optional)
                  </Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="What did you study?"
                    className="mt-2 resize-none"
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={createSessionMutation.isPending}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  {createSessionMutation.isPending ? "Logging..." : "Log Session"}
                </Button>
              </form>
            </div>
          </Card>
        </div>

        {/* Recent Sessions */}
        {studySessions && studySessions.length > 0 && (
          <Card className="bg-white shadow-lg">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Study Sessions</h2>
              <div className="space-y-4">
                {studySessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="border-l-4 border-indigo-500 pl-4 py-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">{session.subject || "General Study"}</p>
                        <p className="text-sm text-gray-600">{new Date(session.date).toLocaleDateString()}</p>
                        {session.notes && <p className="text-sm text-gray-700 mt-1">{session.notes}</p>}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-indigo-600">{session.hoursStudied} hrs</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
