import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function ComparisonView() {
  const { data: topUsers = [] } = trpc.leaderboard.getTop.useQuery({ limit: 50 });
  const { data: toppers = [] } = trpc.toppers.getToppers.useQuery();

  // Calculate statistics for HSLC Prep Hub
  const hslcStats = {
    totalPerformers: topUsers.length,
    avgPoints: topUsers.length > 0 ? Math.round(topUsers.reduce((sum: number, u: any) => sum + u.points, 0) / topUsers.length) : 0,
    avgTopicsCompleted: topUsers.length > 0 ? Math.round(topUsers.reduce((sum: number, u: any) => sum + u.topicsCompleted, 0) / topUsers.length) : 0,
    avgHoursStudied: topUsers.length > 0 ? Math.round(topUsers.reduce((sum: number, u: any) => sum + parseFloat(u.totalHoursStudied), 0) / topUsers.length) : 0,
  };

  // Calculate statistics for Cognitarium Hub
  const cogniStats = {
    totalPerformers: toppers.length,
    avgPercentage: toppers.length > 0 ? (toppers.reduce((sum: number, t: any) => {
      const percentage = parseFloat(t.percentage);
      return sum + percentage;
    }, 0) / toppers.length).toFixed(1) : 0,
    avgMarks: toppers.length > 0 ? toppers.reduce((sum: number, t: any) => {
      const marks = parseInt(t.marks.split('/')[0]);
      return sum + marks;
    }, 0) / toppers.length : 0,
  };

  // Board distribution
  const boardDistribution = toppers.reduce((acc: any, t: any) => {
    const existing = acc.find((item: any) => item.name === t.board);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: t.board, value: 1 });
    }
    return acc;
  }, []);

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981'];

  return (
    <div className="space-y-8">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* HSLC Prep Hub Stats */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">HSLC Prep Hub</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Total Performers</p>
              <p className="text-3xl font-bold text-blue-600">{hslcStats.totalPerformers}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Points</p>
              <p className="text-3xl font-bold text-blue-600">{hslcStats.avgPoints}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Topics Completed</p>
              <p className="text-3xl font-bold text-blue-600">{hslcStats.avgTopicsCompleted}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Study Hours</p>
              <p className="text-3xl font-bold text-blue-600">{hslcStats.avgHoursStudied}h</p>
            </div>
          </div>
        </Card>

        {/* Cognitarium Hub Stats */}
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Cognitarium Hub</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Total Performers</p>
              <p className="text-3xl font-bold text-purple-600">{cogniStats.totalPerformers}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Percentage</p>
              <p className="text-3xl font-bold text-purple-600">{cogniStats.avgPercentage}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Marks</p>
              <p className="text-3xl font-bold text-purple-600">{Math.round(cogniStats.avgMarks)}/500</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Boards Represented</p>
              <div className="flex gap-2 mt-2">
                {boardDistribution.map((board: any) => (
                  <Badge key={board.name} variant="outline">{board.name}</Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Board Distribution Chart */}
      {boardDistribution.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Board Distribution (Cognitarium Hub)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={boardDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {boardDistribution.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Top Performers Comparison */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Top Performers Comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* HSLC Prep Hub Top 5 */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">HSLC Prep Hub Top 5</h4>
            <div className="space-y-2">
              {topUsers.slice(0, 5).map((user: any, index: number) => (
                <div key={user.id} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-600">#{index + 1}</span>
                    <span className="text-sm text-gray-700">{(user as any).userName || `User ${user.userId}`}</span>
                  </div>
                  <span className="font-semibold text-blue-600">{user.points} pts</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cognitarium Hub Top 5 */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Cognitarium Hub Top 5</h4>
            <div className="space-y-2">
              {toppers.slice(0, 5).map((topper: any, index: number) => (
                <div key={topper.rank} className="flex items-center justify-between p-2 bg-purple-50 rounded">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-purple-600">#{topper.rank}</span>
                    <span className="text-sm text-gray-700">{topper.name}</span>
                  </div>
                  <span className="font-semibold text-purple-600">{topper.percentage}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Insights */}
      <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Key Insights</h3>
        <div className="space-y-3 text-gray-700">
          <p>
            <span className="font-semibold">HSLC Prep Hub</span> has {hslcStats.totalPerformers} active performers with an average of {hslcStats.avgPoints} points, demonstrating strong engagement through topic completion and study hours.
          </p>
          <p>
            <span className="font-semibold">Cognitarium Hub</span> features {cogniStats.totalPerformers} top performers across {boardDistribution.length} different boards, with an average score of {cogniStats.avgPercentage}% out of 100%.
          </p>
          <p>
            The two platforms complement each other - HSLC Prep Hub focuses on continuous learning and practice, while Cognitarium Hub showcases board exam excellence across multiple educational boards.
          </p>
        </div>
      </Card>
    </div>
  );
}
