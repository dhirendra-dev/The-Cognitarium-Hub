import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Calculator, CheckCircle, Circle } from "lucide-react";
import { toast } from "sonner";

interface MathChapter {
  id: number;
  chapterNumber: number;
  chapterName: string;
  scheduledDate: Date;
  isCompleted: boolean;
}

export default function MathStudyPlan() {
  const { user } = useAuth();
  const [today] = useState(new Date());

  // tRPC queries and mutations
  const { data: mathPlan, refetch: refetchPlan, isLoading } = trpc.mathStudyPlan.getByUser.useQuery();
  const initializeMutation = trpc.mathStudyPlan.initialize.useMutation({
    onSuccess: () => {
      toast.success("Math study plan initialized!");
      refetchPlan();
    },
  });

  const toggleChapterMutation = trpc.mathStudyPlan.toggleChapterCompletion.useMutation({
    onSuccess: () => {
      refetchPlan();
    },
  });

  // Initialize plan on first load
  useEffect(() => {
    if (!isLoading && (!mathPlan || mathPlan.length === 0)) {
      initializeMutation.mutate();
    }
  }, [isLoading]);

  const isCurrentDay = (scheduledDate: Date) => {
    const scheduled = new Date(scheduledDate);
    return (
      scheduled.getDate() === today.getDate() &&
      scheduled.getMonth() === today.getMonth() &&
      scheduled.getFullYear() === today.getFullYear()
    );
  };

  const isPastDay = (scheduledDate: Date) => {
    const scheduled = new Date(scheduledDate);
    scheduled.setHours(0, 0, 0, 0);
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    return scheduled < todayStart;
  };

  const isFutureDay = (scheduledDate: Date) => {
    const scheduled = new Date(scheduledDate);
    scheduled.setHours(0, 0, 0, 0);
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    return scheduled > todayStart;
  };

  // Calculate progress
  const completedCount = (mathPlan || []).filter((ch) => ch.isCompleted).length;
  const totalCount = mathPlan?.length || 0;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Group chapters by date
  const chaptersByDate = (mathPlan || []).reduce(
    (acc, chapter) => {
      const dateKey = new Date(chapter.scheduledDate).toLocaleDateString();
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(chapter);
      return acc;
    },
    {} as Record<string, typeof mathPlan>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Calculator className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-800">Advanced Mathematics Study Plan</h1>
          </div>
          <p className="text-gray-600">December 16-22, 2025 - Intensive Revision Schedule</p>
        </div>

        {/* Overall Progress */}
        <Card className="bg-white shadow-lg mb-8 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Overall Progress</h2>
            <span className="text-2xl font-bold text-indigo-600">{progress}%</span>
          </div>
          <Progress value={progress} className="h-3" />
          <p className="text-sm text-gray-600 mt-4">
            {completedCount} of {totalCount} chapters completed
          </p>
        </Card>

        {/* Study Schedule */}
        <div className="space-y-6">
          {Object.entries(chaptersByDate).map(([dateKey, chapters]) => {
            const date = new Date(chapters?.[0]?.scheduledDate || new Date());
            const isToday = isCurrentDay(date);
            const isPast = isPastDay(date);
            const isFuture = isFutureDay(date);

            return (
              <Card
                key={dateKey}
                className={`overflow-hidden shadow-lg ${
                  isToday ? "border-2 border-green-500 bg-green-50" : "bg-white"
                }`}
              >
                <div className="p-6">
                  {/* Date Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {date.toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </h3>
                      {isToday && (
                        <span className="inline-block mt-2 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                          TODAY
                        </span>
                      )}
                      {isPast && (
                        <span className="inline-block mt-2 px-3 py-1 bg-gray-400 text-white text-xs font-bold rounded-full">
                          PAST
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {(chapters || []).filter((c) => c.isCompleted).length} of {(chapters || []).length} completed
                      </p>
                    </div>
                  </div>

                  {/* Chapters */}
                  <div className="space-y-3">
                    {(chapters || []).map((chapter) => (
                      <div
                        key={chapter.id}
                        className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                          chapter.isCompleted
                            ? "bg-green-50 border-green-300"
                            : isToday
                            ? "bg-yellow-50 border-yellow-300"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <Checkbox
                          checked={chapter.isCompleted || false}
                          onCheckedChange={(checked) => {
                            toggleChapterMutation.mutate({
                              chapterId: chapter.id,
                              isCompleted: checked === true,
                            });
                          }}
                          disabled={toggleChapterMutation.isPending}
                          className="w-6 h-6"
                        />

                        <div className="flex-1">
                          <p
                            className={`font-semibold text-lg ${
                              chapter.isCompleted ? "line-through text-gray-500" : "text-gray-800"
                            }`}
                          >
                            Chapter {chapter.chapterNumber}: {chapter.chapterName}
                          </p>
                          {chapter.isCompleted && (
                            <p className="text-xs text-green-600 mt-1">
                              ✓ Completed on {new Date(chapter.completedDate!).toLocaleDateString()}
                            </p>
                          )}
                        </div>

                        <div className="flex-shrink-0">
                          {chapter.isCompleted ? (
                            <CheckCircle className="w-6 h-6 text-green-500" />
                          ) : (
                            <Circle className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Study Tips */}
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 shadow-lg mt-8 p-6 border-2 border-indigo-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">💡 Study Tips for Advanced Mathematics</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Practice each chapter thoroughly before moving to the next one</li>
            <li>• Focus on solving previous year board exam questions</li>
            <li>• Keep a formula sheet handy for quick reference</li>
            <li>• Solve at least 10-15 problems from each chapter daily</li>
            <li>• Review completed chapters regularly to maintain retention</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
