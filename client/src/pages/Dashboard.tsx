import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Clock, BookOpen, Target, TrendingUp, Plus, FileText, Users, Trophy, ArrowRight, Zap, Award } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import StudyTimer from "@/components/StudyTimer";
import { CertificateWidget } from "@/components/CertificateWidget";

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
  const { data: leaderboardTop } = trpc.leaderboard.getTop.useQuery({ limit: 5 });

  // tRPC mutations
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

  // Calculate countdown
  const calculateCountdown = (targetDate: Date): CountdownState => {
    const now = new Date();
    const difference = targetDate.getTime() - now.getTime();

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  // Update countdowns every second
  useEffect(() => {
    const interval = setInterval(() => {
      setJeeMainCountdown(calculateCountdown(JEE_MAIN_2028_DATE));
      setJeeAdvCountdown(calculateCountdown(JEE_ADVANCED_2028_DATE));
      setBoard12Countdown(calculateCountdown(BOARD_CLASS_12_DATE));
      setBoard11Countdown(calculateCountdown(BOARD_CLASS_11_DATE));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmitSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hoursStudied) {
      toast.error("Please enter hours studied");
      return;
    }

    createSessionMutation.mutate({
      date: new Date(),
      hoursStudied: parseFloat(hoursStudied),
      subject,
      notes: notes || undefined,
    });
  };

  const subjectProgress: SubjectProgress[] = [
    { subject: "Physics", completion: 65, color: "#3b82f6" },
    { subject: "Chemistry", completion: 58, color: "#10b981" },
    { subject: "Mathematics", completion: 72, color: "#f59e0b" },
  ];

  const chartData = [
    { day: "Mon", hours: 3 },
    { day: "Tue", hours: 4 },
    { day: "Wed", hours: 2 },
    { day: "Thu", hours: 5 },
    { day: "Fri", hours: 3 },
    { day: "Sat", hours: 6 },
    { day: "Sun", hours: 4 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Welcome back, {user?.name || "Student"}! 🎯
          </h1>
          <p className="text-blue-200">JEE 2028 & Class 11-12 Board Exam Preparation</p>
        </div>

        {/* Exam Countdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* JEE Main 2028 */}
          <Card className="bg-gradient-to-br from-blue-600 to-blue-800 border-blue-400 shadow-xl">
            <div className="p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-6 h-6" />
                <h2 className="text-2xl font-bold">JEE Main 2028</h2>
              </div>
              <p className="text-blue-100 mb-6">January 22, 2028</p>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-blue-700 bg-opacity-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold">{jeeMainCountdown.days}</div>
                  <div className="text-xs text-blue-200">Days</div>
                </div>
                <div className="bg-blue-700 bg-opacity-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold">{jeeMainCountdown.hours}</div>
                  <div className="text-xs text-blue-200">Hrs</div>
                </div>
                <div className="bg-blue-700 bg-opacity-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold">{jeeMainCountdown.minutes}</div>
                  <div className="text-xs text-blue-200">Min</div>
                </div>
                <div className="bg-blue-700 bg-opacity-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold">{jeeMainCountdown.seconds}</div>
                  <div className="text-xs text-blue-200">Sec</div>
                </div>
              </div>
            </div>
          </Card>

          {/* JEE Advanced 2028 */}
          <Card className="bg-gradient-to-br from-purple-600 to-purple-800 border-purple-400 shadow-xl">
            <div className="p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-6 h-6" />
                <h2 className="text-2xl font-bold">JEE Advanced 2028</h2>
              </div>
              <p className="text-purple-100 mb-6">June 4, 2028</p>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-purple-700 bg-opacity-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold">{jeeAdvCountdown.days}</div>
                  <div className="text-xs text-purple-200">Days</div>
                </div>
                <div className="bg-purple-700 bg-opacity-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold">{jeeAdvCountdown.hours}</div>
                  <div className="text-xs text-purple-200">Hrs</div>
                </div>
                <div className="bg-purple-700 bg-opacity-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold">{jeeAdvCountdown.minutes}</div>
                  <div className="text-xs text-purple-200">Min</div>
                </div>
                <div className="bg-purple-700 bg-opacity-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold">{jeeAdvCountdown.seconds}</div>
                  <div className="text-xs text-purple-200">Sec</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Class 12 Board Exam */}
          <Card className="bg-gradient-to-br from-green-600 to-green-800 border-green-400 shadow-xl">
            <div className="p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-6 h-6" />
                <h2 className="text-2xl font-bold">Class 12 Board Exam</h2>
              </div>
              <p className="text-green-100 mb-6">February 15, 2028</p>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-green-700 bg-opacity-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold">{board12Countdown.days}</div>
                  <div className="text-xs text-green-200">Days</div>
                </div>
                <div className="bg-green-700 bg-opacity-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold">{board12Countdown.hours}</div>
                  <div className="text-xs text-green-200">Hrs</div>
                </div>
                <div className="bg-green-700 bg-opacity-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold">{board12Countdown.minutes}</div>
                  <div className="text-xs text-green-200">Min</div>
                </div>
                <div className="bg-green-700 bg-opacity-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold">{board12Countdown.seconds}</div>
                  <div className="text-xs text-green-200">Sec</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Class 11 Board Exam */}
          <Card className="bg-gradient-to-br from-orange-600 to-orange-800 border-orange-400 shadow-xl">
            <div className="p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-6 h-6" />
                <h2 className="text-2xl font-bold">Class 11 Board Exam</h2>
              </div>
              <p className="text-orange-100 mb-6">November 20, 2027</p>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-orange-700 bg-opacity-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold">{board11Countdown.days}</div>
                  <div className="text-xs text-orange-200">Days</div>
                </div>
                <div className="bg-orange-700 bg-opacity-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold">{board11Countdown.hours}</div>
                  <div className="text-xs text-orange-200">Hrs</div>
                </div>
                <div className="bg-orange-700 bg-opacity-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold">{board11Countdown.minutes}</div>
                  <div className="text-xs text-orange-200">Min</div>
                </div>
                <div className="bg-orange-700 bg-opacity-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold">{board11Countdown.seconds}</div>
                  <div className="text-xs text-orange-200">Sec</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Study Statistics & Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Subject Progress */}
          <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600 shadow-lg lg:col-span-2">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                Subject Progress
              </h3>
              <div className="space-y-4">
                {subjectProgress.map((item) => (
                  <div key={item.subject}>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-300 font-medium">{item.subject}</span>
                      <span className="text-blue-300 font-bold">{item.completion}%</span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ width: `${item.completion}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600 shadow-lg">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-6">Quick Stats</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm">Total Study Hours</p>
                  <p className="text-3xl font-bold text-blue-400">{totalHours || 0}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Study Sessions</p>
                  <p className="text-3xl font-bold text-green-400">{studySessions?.length || 0}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Study Session Form */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600 shadow-lg mb-12">
          <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-400" />
              Log Study Session
            </h3>
            <form onSubmit={handleSubmitSession} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-gray-300">Hours Studied</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={hoursStudied}
                    onChange={(e) => setHoursStudied(e.target.value)}
                    placeholder="e.g., 2.5"
                    className="mt-2 bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Subject</Label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mt-2 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                  >
                    <option>Physics</option>
                    <option>Chemistry</option>
                    <option>Mathematics</option>
                    <option>Biology</option>
                  </select>
                </div>
                <div>
                  <Label className="text-gray-300">Notes (Optional)</Label>
                  <Input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="What did you study?"
                    className="mt-2 bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={createSessionMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2"
              >
                {createSessionMutation.isPending ? "Logging..." : "Log Session"}
              </Button>
            </form>
          </div>
        </Card>

        {/* Weekly Study Chart */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600 shadow-lg mb-12">
          <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-6">Weekly Study Hours</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                <Bar dataKey="hours" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500 shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate("/study-materials")}>
            <div className="p-6 text-white text-center">
              <FileText className="w-8 h-8 mx-auto mb-3" />
              <h4 className="font-bold mb-1">Study Materials</h4>
              <p className="text-sm text-blue-100">Browse PDFs & Notes</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-600 to-green-700 border-green-500 shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate("/board-questions")}>
            <div className="p-6 text-white text-center">
              <Target className="w-8 h-8 mx-auto mb-3" />
              <h4 className="font-bold mb-1">Board Questions</h4>
              <p className="text-sm text-green-100">Practice MCQs</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-purple-500 shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate("/posts")}>
            <div className="p-6 text-white text-center">
              <Users className="w-8 h-8 mx-auto mb-3" />
              <h4 className="font-bold mb-1">Community</h4>
              <p className="text-sm text-purple-100">Share & Learn</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-600 to-orange-700 border-orange-500 shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate("/leaderboard")}>
            <div className="p-6 text-white text-center">
              <Trophy className="w-8 h-8 mx-auto mb-3" />
              <h4 className="font-bold mb-1">Leaderboard</h4>
              <p className="text-sm text-orange-100">Top Performers</p>
            </div>
          </Card>
        </div>

        {/* Study Timer & PDF Section */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <StudyTimer />
          <CertificateWidget />
          
          {/* PDF Browser */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-bold text-gray-900">Study Materials (PDF)</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">Access curated study materials and notes for PCMb stream</p>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => navigate("/study-materials")}>
                Browse Study Materials
              </Button>
            </div>
          </Card>
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
