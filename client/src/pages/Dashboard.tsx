import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Clock, BookOpen, Target, TrendingUp, Plus, FileText, Users, Trophy, ArrowRight, Zap, Award, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import JEEResourceMap from "@/components/JEEResourceMap";

// JEE 2028 Exam Dates
const JEE_MAIN_2028_DATE = new Date("2028-01-22T09:00:00");
const JEE_ADVANCED_2028_DATE = new Date("2028-06-04T09:00:00");
const BOARD_CLASS_12_DATE = new Date("2028-02-15T10:00:00");
const BOARD_CLASS_11_DATE = new Date("2027-11-20T10:00:00");

interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface SubjectProgress {
  subject: string;
  completion: number;
  color: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [jeeMainCountdown, setJeeMainCountdown] = useState<CountdownState>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [jeeAdvCountdown, setJeeAdvCountdown] = useState<CountdownState>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [board12Countdown, setBoard12Countdown] = useState<CountdownState>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [board11Countdown, setBoard11Countdown] = useState<CountdownState>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [hoursStudied, setHoursStudied] = useState("");
  const [subject, setSubject] = useState("Physics");
  const [notes, setNotes] = useState("");

  // tRPC queries
  const { data: studySessions, refetch: refetchSessions } = trpc.studySessions.getByUser.useQuery({ daysBack: 30 });
  const { data: totalHours } = trpc.studySessions.getTotalHours.useQuery({ daysBack: 30 });
  const { data: pdfDocuments } = trpc.pdf.getBySubject.useQuery({ limit: 8 });
  const { data: leaderboardTop } = trpc.leaderboard.getTop.useQuery({ limit: 5 });
  
  const createSessionMutation = trpc.studySessions.create.useMutation({
    onSuccess: () => {
      toast.success("Study session logged!");
      setHoursStudied("");
      setNotes("");
      refetchSessions();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to log session");
    },
  });

  // Countdown timer effect
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      
      const updateState = (targetDate: Date, setState: any) => {
        const diff = targetDate.getTime() - now.getTime();
        if (diff > 0) {
          setState({
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / 1000 / 60) % 60),
            seconds: Math.floor((diff / 1000) % 60),
          });
        } else {
          setState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        }
      };

      updateState(JEE_MAIN_2028_DATE, setJeeMainCountdown);
      updateState(JEE_ADVANCED_2028_DATE, setJeeAdvCountdown);
      updateState(BOARD_CLASS_12_DATE, setBoard12Countdown);
      updateState(BOARD_CLASS_11_DATE, setBoard11Countdown);
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

  const subjectProgress: SubjectProgress[] = [
    { subject: "Physics", completion: 65, color: "from-blue-500 to-cyan-500" },
    { subject: "Chemistry", completion: 72, color: "from-purple-500 to-pink-500" },
    { subject: "Mathematics", completion: 58, color: "from-green-500 to-emerald-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome back, {user?.name}! 🎯</h1>
          <p className="text-blue-200">JEE 2028 & Class 11-12 Board Exam Preparation</p>
        </div>

        {/* JEE Resources Map - Featured at Top */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <MapPin className="w-6 h-6" />
            JEE Study Resources & MCQ Practice Centers
          </h2>
          <JEEResourceMap height="h-96" />
        </div>

        {/* Exam Countdowns - 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* JEE Main 2028 */}
          <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-2xl border-0">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">JEE Main 2028</h2>
                  <p className="text-blue-100 text-sm">January 22, 2028</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Days", value: jeeMainCountdown.days },
                  { label: "Hrs", value: jeeMainCountdown.hours },
                  { label: "Min", value: jeeMainCountdown.minutes },
                  { label: "Sec", value: jeeMainCountdown.seconds },
                ].map((item) => (
                  <div key={item.label} className="bg-white/20 rounded p-2 text-center">
                    <div className="text-2xl font-bold">{String(item.value).padStart(2, "0")}</div>
                    <div className="text-xs">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* JEE Advanced 2028 */}
          <Card className="bg-gradient-to-br from-purple-600 to-purple-800 text-white shadow-2xl border-0">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">JEE Advanced 2028</h2>
                  <p className="text-purple-100 text-sm">June 4, 2028</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Days", value: jeeAdvCountdown.days },
                  { label: "Hrs", value: jeeAdvCountdown.hours },
                  { label: "Min", value: jeeAdvCountdown.minutes },
                  { label: "Sec", value: jeeAdvCountdown.seconds },
                ].map((item) => (
                  <div key={item.label} className="bg-white/20 rounded p-2 text-center">
                    <div className="text-2xl font-bold">{String(item.value).padStart(2, "0")}</div>
                    <div className="text-xs">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Class 12 Board Exam */}
          <Card className="bg-gradient-to-br from-green-600 to-green-800 text-white shadow-2xl border-0">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">Class 12 Board Exam</h2>
                  <p className="text-green-100 text-sm">February 15, 2028</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Days", value: board12Countdown.days },
                  { label: "Hrs", value: board12Countdown.hours },
                  { label: "Min", value: board12Countdown.minutes },
                  { label: "Sec", value: board12Countdown.seconds },
                ].map((item) => (
                  <div key={item.label} className="bg-white/20 rounded p-2 text-center">
                    <div className="text-2xl font-bold">{String(item.value).padStart(2, "0")}</div>
                    <div className="text-xs">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Class 11 Board Exam */}
          <Card className="bg-gradient-to-br from-orange-600 to-orange-800 text-white shadow-2xl border-0">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">Class 11 Board Exam</h2>
                  <p className="text-orange-100 text-sm">November 20, 2027</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Days", value: board11Countdown.days },
                  { label: "Hrs", value: board11Countdown.hours },
                  { label: "Min", value: board11Countdown.minutes },
                  { label: "Sec", value: board11Countdown.seconds },
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
            <div className="p-6">
              <BookOpen className="w-8 h-8 text-blue-400 mb-2" />
              <p className="text-gray-300 text-sm">Hours Studied</p>
              <p className="text-3xl font-bold mt-2">{totalHours?.toFixed(1) || "0"}</p>
              <p className="text-xs text-gray-400 mt-1">Last 30 days</p>
            </div>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
            <div className="p-6">
              <Target className="w-8 h-8 text-green-400 mb-2" />
              <p className="text-gray-300 text-sm">Study Sessions</p>
              <p className="text-3xl font-bold mt-2">{studySessions?.length || "0"}</p>
              <p className="text-xs text-gray-400 mt-1">Total sessions</p>
            </div>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
            <div className="p-6">
              <FileText className="w-8 h-8 text-purple-400 mb-2" />
              <p className="text-gray-300 text-sm">Study Materials</p>
              <p className="text-3xl font-bold mt-2">{pdfDocuments?.length || "0"}</p>
              <p className="text-xs text-gray-400 mt-1">PDFs available</p>
            </div>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
            <div className="p-6">
              <Trophy className="w-8 h-8 text-yellow-400 mb-2" />
              <p className="text-gray-300 text-sm">Your Rank</p>
              <p className="text-3xl font-bold mt-2">#42</p>
              <p className="text-xs text-gray-400 mt-1">Leaderboard</p>
            </div>
          </Card>
        </div>

        {/* Subject Progress & Study Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Subject Progress */}
          <div className="lg:col-span-1">
            <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
              <div className="p-6">
                <h3 className="text-lg font-bold mb-6">Subject Progress</h3>
                <div className="space-y-4">
                  {subjectProgress.map((item) => (
                    <div key={item.subject}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">{item.subject}</span>
                        <span className="text-sm text-gray-300">{item.completion}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`bg-gradient-to-r ${item.color} h-2 rounded-full`}
                          style={{ width: `${item.completion}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Study Chart */}
          <div className="lg:col-span-2">
            <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
              <div className="p-6">
                <h3 className="text-lg font-bold mb-6">Study Progress (Last 7 Days)</h3>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                      <YAxis stroke="rgba(255,255,255,0.5)" />
                      <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.2)" }} />
                      <Line type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={3} dot={{ fill: "#3b82f6", r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-400">
                    <p>No study data yet. Start logging your sessions!</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Log Study Session & Featured Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Log Session Form */}
          <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-6">Log Study Session</h3>
              <form onSubmit={handleLogSession} className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-300">Hours Studied</Label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={hoursStudied}
                    onChange={(e) => setHoursStudied(e.target.value)}
                    placeholder="e.g., 2.5"
                    className="mt-2 bg-white/20 border-white/30 text-white placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-300">Subject</Label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mt-2 w-full bg-white/20 border border-white/30 text-white rounded px-3 py-2"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                  </select>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-300">Notes</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes..."
                    className="mt-2 bg-white/20 border-white/30 text-white placeholder:text-gray-400 h-20"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={createSessionMutation.isPending}
                >
                  {createSessionMutation.isPending ? "Logging..." : "Log Session"}
                </Button>
              </form>
            </div>
          </Card>

          {/* Featured Sections */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Study Materials */}
            <Card
              className="bg-gradient-to-br from-purple-600 to-purple-800 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer"
              onClick={() => navigate("/pdf-browser")}
            >
              <div className="p-6">
                <FileText className="w-8 h-8 mb-3" />
                <h3 className="text-lg font-bold mb-2">Study Materials</h3>
                <p className="text-sm text-purple-100 mb-4">
                  Access {pdfDocuments?.length || 0} comprehensive notes, PYQs, and practice papers
                </p>
                <Button variant="outline" className="w-full text-white border-white hover:bg-white/20">
                  Browse <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>

            {/* Mock Tests */}
            <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer">
              <div className="p-6">
                <Target className="w-8 h-8 mb-3" />
                <h3 className="text-lg font-bold mb-2">Mock Tests</h3>
                <p className="text-sm text-blue-100 mb-4">
                  Take full-length JEE Main, JEE Advanced, and board exam mock tests
                </p>
                <Button variant="outline" className="w-full text-white border-white hover:bg-white/20">
                  Start Test <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>

            {/* Community */}
            <Card
              className="bg-gradient-to-br from-green-600 to-green-800 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer"
              onClick={() => navigate("/study-links")}
            >
              <div className="p-6">
                <Users className="w-8 h-8 mb-3" />
                <h3 className="text-lg font-bold mb-2">Community</h3>
                <p className="text-sm text-green-100 mb-4">
                  Join official WhatsApp groups and Telegram channels
                </p>
                <Button variant="outline" className="w-full text-white border-white hover:bg-white/20">
                  Join Now <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>

            {/* Leaderboard */}
            <Card
              className="bg-gradient-to-br from-yellow-600 to-yellow-800 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer"
              onClick={() => navigate("/leaderboard")}
            >
              <div className="p-6">
                <Trophy className="w-8 h-8 mb-3" />
                <h3 className="text-lg font-bold mb-2">Leaderboard</h3>
                <p className="text-sm text-yellow-100 mb-4">
                  See your rank and compete with top performers
                </p>
                <Button variant="outline" className="w-full text-white border-white hover:bg-white/20">
                  View <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Motivational Footer */}
        <div className="mt-12 text-center text-white">
          <p className="text-xl font-bold text-blue-300">Stay disciplined. Stay focused. Stay consistent. 💪</p>
          <p className="text-gray-400 mt-2">Your JEE 2028 and Board Exam success starts here!</p>
        </div>
      </div>
    </div>
  );
}
