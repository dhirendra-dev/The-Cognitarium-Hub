import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Flame, Star } from "lucide-react";
import { toast } from "sonner";

export default function Leaderboard() {
  const { user } = useAuth();
  const [selectedTimeframe, setSelectedTimeframe] = useState<"all" | "month" | "week">("all");

  // tRPC queries
  const { data: topPerformers, isLoading: topLoading } = trpc.leaderboard.getTop.useQuery({
    limit: 20,
  });

  const { data: userRank } = trpc.leaderboard.getUserRank.useQuery();

  const getMedalIcon = (rank: number | undefined) => {
    if (!rank) return null;
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-600" />;
    return null;
  };

  const getRankBadgeColor = (rank: number | undefined) => {
    if (!rank) return "bg-gray-100";
    if (rank === 1) return "bg-yellow-100 text-yellow-800";
    if (rank === 2) return "bg-gray-100 text-gray-800";
    if (rank === 3) return "bg-orange-100 text-orange-800";
    return "bg-blue-100 text-blue-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-yellow-600" />
            <h1 className="text-4xl font-bold text-gray-800">Leaderboard</h1>
          </div>
          <p className="text-gray-600">See how you rank among your peers in exam preparation</p>
        </div>

        {/* Your Rank Card */}
        {userRank && (
          <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg mb-8 p-8 text-white">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div>
                <p className="text-sm font-semibold opacity-90">Your Rank</p>
                <p className="text-4xl font-bold mt-2">#{userRank.rank || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold opacity-90">Total Points</p>
                <p className="text-4xl font-bold mt-2">{userRank.points || 0}</p>
              </div>
              <div>
                <p className="text-sm font-semibold opacity-90">Hours Studied</p>
                <p className="text-4xl font-bold mt-2">{parseFloat(userRank.totalHoursStudied as any).toFixed(1)}</p>
              </div>
              <div>
                <p className="text-sm font-semibold opacity-90">Topics Done</p>
                <p className="text-4xl font-bold mt-2">{userRank.topicsCompleted}</p>
              </div>
              <div>
                <p className="text-sm font-semibold opacity-90">Streak</p>
                <p className="text-4xl font-bold mt-2 flex items-center gap-2">
                  {userRank.streakDays}
                  <Flame className="w-6 h-6" />
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Timeframe Selector */}
        <div className="mb-8 flex gap-3">
          {(["all", "month", "week"] as const).map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                selectedTimeframe === timeframe
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "bg-white text-gray-700 border-2 border-gray-200 hover:border-indigo-300"
              }`}
            >
              {timeframe === "all" ? "All Time" : timeframe === "month" ? "This Month" : "This Week"}
            </button>
          ))}
        </div>

        {/* Top Performers */}
        <Card className="bg-white shadow-lg overflow-hidden">
          <div className="p-6 border-b-2 border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800">Top Performers</h2>
          </div>

          {topLoading ? (
            <div className="p-8 text-center text-gray-500">Loading leaderboard...</div>
          ) : topPerformers && topPerformers.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {topPerformers.map((performer, index) => (
                <div
                  key={performer.id}
                  className={`p-6 flex items-center justify-between transition-all hover:bg-gray-50 ${
                    index < 3 ? "bg-gradient-to-r from-yellow-50 to-transparent" : ""
                  }`}
                >
                  <div className="flex items-center gap-6 flex-1">
                    {/* Rank */}
                    <div className="flex items-center gap-3">
                      {getMedalIcon(performer.rank || undefined)}
                      <Badge className={`text-lg font-bold px-4 py-2 ${getRankBadgeColor(performer.rank || undefined)}`}>
                        #{performer.rank || "N/A"}
                      </Badge>
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                      <p className="font-bold text-gray-800 text-lg">User {performer.userId}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {performer.topicsCompleted} topics • {parseFloat(performer.totalHoursStudied as any).toFixed(1)} hrs
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-6 text-right">
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">POINTS</p>
                      <p className="text-2xl font-bold text-indigo-600 mt-1">{performer.points}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">STREAK</p>
                      <p className="text-2xl font-bold text-orange-600 mt-1 flex items-center justify-end gap-1">
                        {performer.streakDays}
                        <Flame className="w-5 h-5" />
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">AVG SCORE</p>
                      <p className="text-2xl font-bold text-green-600 mt-1">
                        {parseFloat(performer.averageScore as any).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">No leaderboard data yet. Start studying to appear here!</div>
          )}
        </Card>

        {/* Tips Section */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg mt-8 p-6 border-2 border-green-200">
          <div className="flex items-start gap-4">
            <Star className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">How to Climb the Leaderboard</h3>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Study consistently - Log your daily study hours to earn points</li>
                <li>✓ Complete topics - Mark chapters as completed to boost your score</li>
                <li>✓ Maintain streaks - Study every day to build a winning streak</li>
                <li>✓ Solve sample papers - Complete mock tests to improve your average score</li>
                <li>✓ Stay motivated - The leaderboard updates daily with your latest achievements</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
