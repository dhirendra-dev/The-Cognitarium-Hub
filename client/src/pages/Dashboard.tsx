import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Clock, BookOpen, Target, TrendingUp, Plus, FileText, Users, Trophy, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const JEE_EXAM_DATE = new Date("2026-04-03T09:00:00"); // JEE Main 2026
const BOARD_EXAM_DATE = new Date("2026-03-01T10:00:00"); // Board exams

interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [jeeCountdown, setJeeCountdown] = useState<CountdownState>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [boardCountdown, setBoardCountdown] = useState<CountdownState>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [hoursStudied, setHoursStudied] = useState("");
  const [subject, setSubject] = useState("");
  const [notes, setNotes] = useState("");
  const [showForm, setShowForm] = useState(false);

  // tRPC queries and mutations
  const { data: studySessions, refetch: refetchSessions } = trpc.studySessions.getByUser.useQuery({ daysBack: 30 });
  const { data: totalHours } = trpc.studySessions.getTotalHours.useQuery({ daysBack: 30 });
  const { data: pdfDocuments } = trpc.pdf.getBySubject.useQuery({ limit: 5 });
  const { data: leaderboardTop } = trpc.leaderboard.getTop.useQuery({ limit: 5 });
  
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
      
      // JEE countdown
      const jeeDiff = JEE_EXAM_DATE.getTime() - now.getTime();
      if (jeeDiff > 0) {
        setJeeCountdown({
          days: Math.floor(jeeDiff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((jeeDiff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((jeeDiff / 1000 / 60) % 60),
          seconds: Math.floor((jeeDiff / 1000) % 60),
        });
      } else {
        setJeeCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
      
      // Board countdown
      const boardDiff = BOARD_EXAM_DATE.getTime() - now.getTime();
      if (boardDiff > 0) {
        setBoardCountdown({
          days: Math.floor(boardDiff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((boardDiff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((boardDiff / 1000 / 60) % 60),
          seconds: Math.floor((boardDiff / 1000) % 60),
        });
      } else {
        setBoardCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
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
    "Stay disciplined. Stay focused. Stay consistent. 💪",
    "Every hour of study brings you closer to success! 📚",
    "Your dedication today determines your tomorrow! 🎯",
    "The exam is approaching - stay focused and consistent! 🚀",
    "You've got this! Keep pushing forward! ⭐",
  ];

  const currentMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome back, {user?.name}! 👋</h1>
          <p className="text-lg text-gray-600">{currentMessage}</p>
        </div>

        {/* Exam Countdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* JEE Countdown */}
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">JEE Main 2026</h2>
                  <p className="text-blue-100 text-sm">April 3, 2026</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Days", value: jeeCountdown.days },
                  { label: "Hours", value: jeeCountdown.hours },
                  { label: "Mins", value: jeeCountdown.minutes },
                  { label: "Secs", value: jeeCountdown.seconds },
                ].map((item) => (
                  <div key={item.label} className="bg-white/20 rounded p-2 text-center">
                    <div className="text-2xl font-bold">{String(item.value).padStart(2, "0")}</div>
                    <div className="text-xs">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Board Exam Countdown */}
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">Board Exams</h2>
                  <p className="text-purple-100 text-sm">March 1, 2026</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Days", value: boardCountdown.days },
                  { label: "Hours", value: boardCountdown.hours },
                  { label: "Mins", value: boardCountdown.minutes },
                  { label: "Secs", value: boardCountdown.seconds },
                ].map((item) => (
                  <div key={item.label} className="bg-white/20 rounded p-2 text-center">
                    <div className="text-2xl font-bold">{String(item.value).padStart(2, "0")}</div>
                    <div className="text-xs">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Hours Studied</p>
                  <p className="text-4xl font-bold text-blue-600 mt-2">{totalHours?.toFixed(1) || "0"}</p>
                  <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
                </div>
                <BookOpen className="w-12 h-12 text-blue-100" />
              </div>
            </div>
          </Card>

          <Card className="bg-white shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Study Sessions</p>
                  <p className="text-4xl font-bold text-green-600 mt-2">{studySessions?.length || "0"}</p>
                  <p className="text-xs text-gray-500 mt-1">Total sessions</p>
                </div>
                <Target className="w-12 h-12 text-green-100" />
              </div>
            </div>
          </Card>

          <Card className="bg-white shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Study Materials</p>
                  <p className="text-4xl font-bold text-purple-600 mt-2">{pdfDocuments?.length || "0"}</p>
                  <p className="text-xs text-gray-500 mt-1">PDFs available</p>
                </div>
                <FileText className="w-12 h-12 text-purple-100" />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Study Progress Chart */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-lg">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-indigo-600" />
                    <h2 className="text-xl font-bold text-gray-800">Study Progress (Last 7 Days)</h2>
                  </div>
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
          </div>

          {/* Log Study Session Form */}
          <Card className="bg-white shadow-lg h-fit">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Plus className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-800">Log Session</h2>
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
                    Subject
                  </Label>
                  <Input
                    id="subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Physics"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes..."
                    className="mt-2 h-20"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  disabled={createSessionMutation.isPending}
                >
                  {createSessionMutation.isPending ? "Logging..." : "Log Session"}
                </Button>
              </form>
            </div>
          </Card>
        </div>

        {/* Featured Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Study Materials */}
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate("/pdf-browser")}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-8 h-8 text-purple-600" />
                <h3 className="text-lg font-bold text-gray-800">Study Materials</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Access {pdfDocuments?.length || 0} study materials including notes, PYQs, and practice papers.
              </p>
              <Button variant="outline" className="w-full">
                Browse PDFs <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>

          {/* Community */}
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate("/study-links")}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-8 h-8 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-800">Community</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Join official WhatsApp groups, Telegram channels, and Google Classroom for discussions and updates.
              </p>
              <Button variant="outline" className="w-full">
                Join Community <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>

          {/* Leaderboard */}
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate("/leaderboard")}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-8 h-8 text-yellow-600" />
                <h3 className="text-lg font-bold text-gray-800">Leaderboard</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                See where you rank among peers and get motivated by top performers.
              </p>
              <Button variant="outline" className="w-full">
                View Rankings <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
