import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Flame, Zap } from "lucide-react";

export function StreaksWidget() {
  const { data: streakData, isLoading: streakLoading } = trpc.streaks.getStreak.useQuery();
  const { data: levelData, isLoading: levelLoading } = trpc.streaks.getLevel.useQuery();
  const { data: xpData, isLoading: xpLoading } = trpc.streaks.getTotalXP.useQuery();
  const { data: progressData, isLoading: progressLoading } = trpc.streaks.getXPProgress.useQuery();
  
  const awardLoginXP = trpc.streaks.awardLoginXP.useMutation();

  // Award login XP on component mount
  useEffect(() => {
    awardLoginXP.mutate();
  }, []);

  const streak = streakData?.streak || 0;
  const level = levelData?.level || 1;
  const totalXP = xpData?.totalXP || 0;
  const progress = progressData || { current: 0, needed: 500, percentage: 0 };

  return (
    <div className="space-y-4">
      {/* Main Streak Display */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-6xl">🔥</div>
            <div>
              <p className="text-sm text-gray-600">Current Streak</p>
              <p className="text-4xl font-bold text-orange-600">{streak}</p>
              <p className="text-xs text-gray-500">days</p>
            </div>
          </div>
          {streak > 0 && (
            <div className="text-right">
              <p className="text-sm font-semibold text-orange-600">Keep it up!</p>
              <p className="text-xs text-gray-600">Don't break your streak</p>
            </div>
          )}
        </div>
      </Card>

      {/* Level and XP Display */}
      <div className="grid grid-cols-2 gap-4">
        {/* Level Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <p className="text-sm font-semibold text-gray-700">Level</p>
          </div>
          <p className="text-3xl font-bold text-blue-600">{level}</p>
          <p className="text-xs text-gray-600 mt-1">Keep learning!</p>
        </Card>

        {/* Total XP Card */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-purple-600" />
            <p className="text-sm font-semibold text-gray-700">Total XP</p>
          </div>
          <p className="text-3xl font-bold text-purple-600">{totalXP.toLocaleString()}</p>
          <p className="text-xs text-gray-600 mt-1">Points earned</p>
        </Card>
      </div>

      {/* XP Progress Bar */}
      <Card className="bg-white border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-700">Level Progress</p>
          <p className="text-xs text-gray-600">
            {progress.current} / {progress.needed}
          </p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-500"
            style={{ width: `${Math.min(progress.percentage, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {Math.round(progress.percentage)}% to next level
        </p>
      </Card>

      {/* Motivational Message */}
      {streak === 0 && (
        <Card className="bg-yellow-50 border-yellow-200 p-4">
          <p className="text-sm text-yellow-800">
            🎯 Start your streak today! Log in daily to build your momentum.
          </p>
        </Card>
      )}

      {streak > 0 && streak < 7 && (
        <Card className="bg-blue-50 border-blue-200 p-4">
          <p className="text-sm text-blue-800">
            🚀 You're on a {streak}-day streak! Keep going to reach 7 days!
          </p>
        </Card>
      )}

      {streak >= 7 && streak < 14 && (
        <Card className="bg-green-50 border-green-200 p-4">
          <p className="text-sm text-green-800">
            ⭐ Amazing! {streak}-day streak! You're building great habits!
          </p>
        </Card>
      )}

      {streak >= 14 && (
        <Card className="bg-purple-50 border-purple-200 p-4">
          <p className="text-sm text-purple-800">
            🏆 Incredible! {streak}-day streak! You're a true champion!
          </p>
        </Card>
      )}
    </div>
  );
}
