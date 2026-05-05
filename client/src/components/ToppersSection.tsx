import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Trophy, Medal, Sparkles } from "lucide-react";

export default function ToppersSection() {
  const { data: toppers, isLoading } = trpc.toppers.getToppers.useQuery();

  if (isLoading) {
    return (
      <Card className="bg-white shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  if (!toppers || toppers.length === 0) {
    return null;
  }

  // Get top 10 toppers
  const topTen = toppers.slice(0, 10);

  const getMedalIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Medal className="w-6 h-6 text-orange-600" />;
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="w-10 h-10 text-purple-500" />
          <h2 className="text-3xl font-bold text-gray-800">Community Toppers</h2>
        </div>
        <p className="text-gray-600">Top performers from Cognitarium Hub Merit List 2026</p>
      </div>

      {/* Toppers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topTen.map((topper: any, index: number) => (
          <Card key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600">
                {getMedalIcon(index) || (
                  <span className="text-white font-bold text-lg">#{index + 1}</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-lg">{topper.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-semibold">{topper.percentage}</span> • {topper.board}
                </p>
                <p className="text-xs text-gray-500 mt-2">{topper.marks}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* View All Link */}
      <div className="text-center mt-8">
        <a
          href="https://cogni-list-ayvbt5du.manus.space/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow"
        >
          View Full Merit List →
        </a>
      </div>
    </div>
  );
}
