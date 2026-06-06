import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Zap, BookOpen, Target } from "lucide-react";

export function UserStatsWidget() {
  const { user } = useAuth();
  const { data: leaderboardTop, isLoading: leaderboardLoading } = trpc.leaderboard.getTop.useQuery({ limit: 10 });
  const { data: totalHours, isLoading: hoursLoading } = trpc.studySessions.getTotalHours.useQuery({ daysBack: 30 });

  if (leaderboardLoading || hoursLoading) {
    return (
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">Your Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Find current user's rank
  const userRank = leaderboardTop?.findIndex((entry) => entry.userId === user?.id) || -1;
  const userXP = leaderboardTop?.find((entry) => entry.userId === user?.id)?.points || 0;

  return (
    <Card className="border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          Your Progress
        </CardTitle>
        <CardDescription>Track your learning journey</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* XP Stats */}
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-600" />
              <p className="text-sm font-medium text-gray-600">Total XP</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {userXP}
            </p>
            {userRank >= 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Rank: #{userRank + 1}
              </p>
            )}
          </div>

          {/* Level Stats */}
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-purple-600" />
              <p className="text-sm font-medium text-gray-600">Level</p>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {Math.floor(userXP / 500) + 1}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {userXP % 500} / 500 XP
            </p>
          </div>

          {/* Study Hours */}
          <div className="bg-white rounded-lg p-4 border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-orange-600" />
              <p className="text-sm font-medium text-gray-600">Study Hours</p>
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {Math.round((totalHours || 0) * 10) / 10}
            </p>
            <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
          </div>

          {/* Top Performer */}
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-green-600" />
              <p className="text-sm font-medium text-gray-600">Top Performer</p>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {leaderboardTop?.[0]?.userName || "N/A"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {leaderboardTop?.[0]?.points || 0} XP
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        {userXP && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-600 mb-2">
              Progress to Next Level
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((userXP % 500) / 500) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
