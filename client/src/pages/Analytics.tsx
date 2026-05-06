import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, Eye, Clock } from "lucide-react";

// Mock data for analytics
const sectionEngagement = [
  { section: "Study Materials", clicks: 245, views: 1203, avgTime: "12m" },
  { section: "Community Posts", clicks: 189, views: 856, avgTime: "8m" },
  { section: "Toppers", clicks: 156, views: 742, avgTime: "6m" },
  { section: "Time Trackers", clicks: 98, views: 421, avgTime: "5m" },
];

const dailyEngagement = [
  { date: "May 1", users: 245, sessions: 412 },
  { date: "May 2", users: 312, sessions: 521 },
  { date: "May 3", users: 289, sessions: 478 },
  { date: "May 4", users: 401, sessions: 623 },
  { date: "May 5", users: 378, sessions: 712 },
  { date: "May 6", users: 456, sessions: 834 },
];

const sectionDistribution = [
  { name: "Study Materials", value: 35, color: "#3b82f6" },
  { name: "Community Posts", value: 25, color: "#8b5cf6" },
  { name: "Toppers", value: 22, color: "#ec4899" },
  { name: "Time Trackers", value: 18, color: "#f59e0b" },
];

const userMetrics = [
  { label: "Total Users", value: "2,456", icon: Users, color: "bg-blue-100 text-blue-600" },
  { label: "Active Sessions", value: "834", icon: TrendingUp, color: "bg-green-100 text-green-600" },
  { label: "Total Views", value: "12.5K", icon: Eye, color: "bg-purple-100 text-purple-600" },
  { label: "Avg Session Time", value: "8m 24s", icon: Clock, color: "bg-orange-100 text-orange-600" },
];

export default function Analytics() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">Track user engagement and platform performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {userMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${metric.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Daily Engagement Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Engagement Trend</CardTitle>
          <CardDescription>User sessions and active users over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyEngagement}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} name="Active Users" />
              <Line type="monotone" dataKey="sessions" stroke="#8b5cf6" strokeWidth={2} name="Sessions" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Section Engagement & Distribution */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Section Engagement</CardTitle>
              <CardDescription>Clicks and views by homepage section</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sectionEngagement}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="section" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="clicks" fill="#3b82f6" name="Clicks" />
                  <Bar dataKey="views" fill="#8b5cf6" name="Views" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic Distribution</CardTitle>
            <CardDescription>Percentage by section</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sectionDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sectionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Metrics by Section</CardTitle>
          <CardDescription>Complete engagement statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Section</th>
                  <th className="text-left py-3 px-4 font-semibold">Clicks</th>
                  <th className="text-left py-3 px-4 font-semibold">Views</th>
                  <th className="text-left py-3 px-4 font-semibold">Avg Time</th>
                  <th className="text-left py-3 px-4 font-semibold">CTR %</th>
                </tr>
              </thead>
              <tbody>
                {sectionEngagement.map((item, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{item.section}</td>
                    <td className="py-3 px-4 font-medium">{item.clicks}</td>
                    <td className="py-3 px-4">{item.views}</td>
                    <td className="py-3 px-4">{item.avgTime}</td>
                    <td className="py-3 px-4">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                        {((item.clicks / item.views) * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Analytics</CardTitle>
          <CardDescription>Download reports in various formats</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">📊 Export as PDF</Button>
            <Button variant="outline">📈 Export as CSV</Button>
            <Button variant="outline">📋 Generate Report</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
