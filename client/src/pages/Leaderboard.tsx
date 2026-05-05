import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Flame } from "lucide-react";
import { useState } from "react";
import ComparisonView from "@/components/ComparisonView";

export default function Leaderboard() {
  const { user } = useAuth();
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null);
  const { data: topUsers } = trpc.leaderboard.getTop.useQuery({ limit: 50 });
  const { data: userRank } = trpc.leaderboard.getUserRank.useQuery();
  const { data: allToppers = [] } = trpc.toppers.getToppers.useQuery();

  // Filter toppers by selected board
  const filteredToppers = selectedBoard
    ? allToppers.filter((t: any) => t.board === selectedBoard)
    : allToppers;

  // Get unique boards from toppers data
  const boards = Array.from(new Set(allToppers.map((t: any) => t.board))).sort();

  const getMedalIcon = (position: number) => {
    if (position === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (position === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (position === 3) return <Medal className="w-6 h-6 text-orange-600" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-10 h-10 text-yellow-500" />
            <h1 className="text-4xl font-bold text-gray-800">Leaderboard</h1>
          </div>
          <p className="text-gray-600">Top performers in HSLC exam preparation</p>
        </div>

        {/* Your Rank */}
        {userRank && (
          <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg p-8 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold opacity-90">Your Rank</p>
                <h2 className="text-4xl font-bold mt-2">#{userRank.rank || "—"}</h2>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold opacity-90">Points</p>
                <p className="text-4xl font-bold mt-2">{userRank.points || 0}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold opacity-90">Streak</p>
                <div className="flex items-center gap-2 mt-2">
                  <Flame className="w-6 h-6" />
                  <p className="text-3xl font-bold">{(userRank as any).currentStreak || 0}</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Leaderboard Table */}
        <Card className="bg-white shadow-lg overflow-hidden">
          <div className="p-6 border-b-2 border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800">Top 50 Performers</h2>
          </div>

          {topUsers && topUsers.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {topUsers.map((performer, index) => (
                <div
                  key={performer.id}
                  className={`p-6 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                    index < 3 ? "bg-gradient-to-r from-yellow-50 to-transparent" : ""
                  }`}
                >
                  <div className="flex items-center gap-6 flex-1">
                    <div className="flex items-center justify-center w-12 h-12">
                      {getMedalIcon(index + 1) || (
                        <span className="text-2xl font-bold text-indigo-600">#{index + 1}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{(performer as any).userName || `User ${performer.userId}`}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {performer.topicsCompleted} topics • {parseFloat(performer.totalHoursStudied as any).toFixed(1)} hrs
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-sm text-gray-600 font-semibold">Streak</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <p className="font-bold text-gray-800">{(performer as any).currentStreak || 0}</p>
                      </div>
                    </div>
                    <div className="text-right min-w-24">
                      <p className="text-2xl font-bold text-indigo-600">{performer.points}</p>
                      <p className="text-xs text-gray-500">points</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>No leaderboard data available yet. Start studying to appear on the leaderboard!</p>
            </div>
          )}
        </Card>

        {/* Community Toppers Section with Board Filter */}
        <div className="mt-12 mb-12">
          <Card className="bg-white shadow-lg p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Community Toppers</h2>
              <p className="text-gray-600 mb-4">Top performers from Cognitarium Hub Merit List 2026</p>
              
              {/* Board Filter Buttons */}
              <div className="flex flex-wrap gap-2 mb-6">
                <Button
                  variant={selectedBoard === null ? "default" : "outline"}
                  onClick={() => setSelectedBoard(null)}
                  size="sm"
                >
                  All Boards ({allToppers.length})
                </Button>
                {boards.map((board) => {
                  const count = allToppers.filter((t: any) => t.board === board).length;
                  return (
                    <Button
                      key={board}
                      variant={selectedBoard === board ? "default" : "outline"}
                      onClick={() => setSelectedBoard(board)}
                      size="sm"
                    >
                      {board} ({count})
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Toppers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredToppers.slice(0, 10).map((topper: any) => (
                <Card key={topper.rank} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl font-bold text-blue-600">#{topper.rank}</span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{topper.board}</span>
                      </div>
                      <h3 className="font-semibold text-gray-800">{topper.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{topper.marks}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">{topper.percentage}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            {filteredToppers.length > 10 && (
              <div className="mt-6 text-center">
                <Button variant="outline" onClick={() => window.location.href = '/community-toppers'}>
                  View All {filteredToppers.length} Toppers →
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Comparison View */}
        <div className="mt-12 mb-12">
          <ComparisonView />
        </div>

        {/* Info Section */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg p-6 mt-8 border-2 border-blue-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">How Points Are Calculated</h3>
          <div className="space-y-3 text-gray-700">
            <p>
              <span className="font-semibold">Topics Completed:</span> 10 points per topic
            </p>
            <p>
              <span className="font-semibold">Study Hours:</span> 1 point per hour
            </p>
            <p>
              <span className="font-semibold">Daily Streak:</span> Bonus points for consecutive days of study
            </p>
            <p>
              <span className="font-semibold">Sample Papers:</span> 5 points per paper completed
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
