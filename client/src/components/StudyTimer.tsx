import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, Pause, RotateCcw, CheckCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function StudyTimer() {
  const [duration, setDuration] = useState(25); // 25 min Pomodoro default
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [subject, setSubject] = useState("General");
  const [todayTime, setTodayTime] = useState(0);

  const createSessionMutation = trpc.studyTimer.create.useMutation({
    onSuccess: () => {
      toast.success("Study session started!");
    },
  });

  const completeSessionMutation = trpc.studyTimer.complete.useMutation({
    onSuccess: () => {
      toast.success("Study session completed!");
      setIsRunning(false);
      setTimeLeft(duration * 60);
    },
  });

  const getDailyTimeMutation = trpc.studyTimer.getDailyTime.useQuery(
    { date: new Date() },
    { refetchInterval: 60000 }
  );

  useEffect(() => {
    if (getDailyTimeMutation.data) {
      setTodayTime(getDailyTimeMutation.data);
    }
  }, [getDailyTimeMutation.data]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            toast.success("Study session completed! Great work!");
            completeSessionMutation.mutate({ id: 0 });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleStart = () => {
    if (!isRunning) {
      createSessionMutation.mutate({
        date: new Date(),
        subject,
        duration,
      });
      setIsRunning(true);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(duration * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            <CardTitle>Study Timer</CardTitle>
          </div>
          <Badge variant="secondary">Today: {Math.floor(todayTime)} min</Badge>
        </div>
        <CardDescription>Track your focused study sessions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timer Display */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="90"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              <circle
                cx="96"
                cy="96"
                r="90"
                fill="none"
                stroke="#9333ea"
                strokeWidth="8"
                strokeDasharray={`${(progress / 100) * 565.48} 565.48`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-5xl font-bold text-purple-600">
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-gray-600">{subject}</div>
            </div>
          </div>
        </div>

        {/* Subject Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Subject</label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g., Physics, Chemistry, Math"
            disabled={isRunning}
            className="border-purple-200"
          />
        </div>

        {/* Duration Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Duration (minutes)</label>
          <div className="flex gap-2">
            {[15, 25, 45, 60].map((min) => (
              <Button
                key={min}
                variant={duration === min ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setDuration(min);
                  setTimeLeft(min * 60);
                }}
                disabled={isRunning}
                className={duration === min ? "bg-purple-600" : ""}
              >
                {min}m
              </Button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2 justify-center">
          <Button
            onClick={handleStart}
            disabled={isRunning}
            className="bg-green-600 hover:bg-green-700 gap-2"
          >
            <Play className="w-4 h-4" />
            Start
          </Button>
          <Button
            onClick={handlePause}
            disabled={!isRunning}
            variant="outline"
            className="gap-2"
          >
            <Pause className="w-4 h-4" />
            Pause
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-purple-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.floor(todayTime / 60)}h {todayTime % 60}m
            </div>
            <div className="text-xs text-gray-600">Today's Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{progress.toFixed(0)}%</div>
            <div className="text-xs text-gray-600">Session Progress</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
