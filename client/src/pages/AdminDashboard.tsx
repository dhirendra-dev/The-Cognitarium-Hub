import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, BookOpen, BarChart3, Trash2, Shield, User, Award } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { AdminCertificateManager } from "@/components/AdminCertificateManager";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [selectedUser, setSelectedUser] = useState<number | null>(null);

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/dashboard");
      toast.error("Admin access required");
    }
  }, [user, navigate]);

  // tRPC queries
  const { data: stats } = trpc.admin.getDashboardStats.useQuery();
  const { data: allUsers } = trpc.admin.getAllUsers.useQuery();
  const { data: allSessions } = trpc.admin.getAllStudySessions.useQuery();
  const { data: userStats } = trpc.admin.getUserStats.useQuery(
    { userId: selectedUser || 0 },
    { enabled: selectedUser !== null }
  );

  // tRPC mutations
  const updateRoleMutation = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => {
      toast.success("User role updated");
    },
  });

  const deleteUserMutation = trpc.admin.deleteUser.useMutation({
    onSuccess: () => {
      toast.success("User deleted successfully");
      setSelectedUser(null);
    },
  });

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8 flex items-center justify-center">
        <Card className="bg-white shadow-lg p-8 max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600">You do not have admin access to this page.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-red-600" />
            <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
          </div>
          <p className="text-gray-600">Manage users, view statistics, and monitor platform activity</p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Total Users</p>
                  <p className="text-4xl font-bold text-blue-600 mt-2">{stats.totalUsers}</p>
                </div>
                <Users className="w-12 h-12 text-blue-300" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Study Sessions</p>
                  <p className="text-4xl font-bold text-green-600 mt-2">{stats.totalStudySessions}</p>
                </div>
                <BookOpen className="w-12 h-12 text-green-300" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Topics Completed</p>
                  <p className="text-4xl font-bold text-purple-600 mt-2">{stats.totalTopicsCompleted}</p>
                </div>
                <BarChart3 className="w-12 h-12 text-purple-300" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Completion Rate</p>
                  <p className="text-4xl font-bold text-orange-600 mt-2">
                    {stats.totalTopics > 0 ? Math.round((stats.totalTopicsCompleted / stats.totalTopics) * 100) : 0}%
                  </p>
                </div>
                <BarChart3 className="w-12 h-12 text-orange-300" />
              </div>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white shadow-lg mb-8">
            <TabsTrigger value="users">All Users</TabsTrigger>
            <TabsTrigger value="sessions">Study Sessions</TabsTrigger>
            <TabsTrigger value="leaderboard">Top Performers</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
            <TabsTrigger value="pdfs">PDF Management</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="bg-white shadow-lg overflow-hidden">
              <div className="p-6 border-b-2 border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800">All Users</h2>
              </div>

              {allUsers && allUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Joined</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {allUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-800 font-semibold">{u.name || "N/A"}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{u.email || "N/A"}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                u.role === "admin"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedUser(u.id)}
                              className="text-xs"
                            >
                              View Stats
                            </Button>
                            {u.role !== "admin" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateRoleMutation.mutate({ userId: u.id, role: "admin" })}
                                className="text-xs"
                              >
                                <Shield className="w-3 h-3 mr-1" />
                                Make Admin
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this user?")) {
                                  deleteUserMutation.mutate({ userId: u.id });
                                }
                              }}
                              className="text-xs"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">No users found</div>
              )}
            </Card>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions">
            <Card className="bg-white shadow-lg overflow-hidden">
              <div className="p-6 border-b-2 border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800">All Study Sessions</h2>
              </div>

              {allSessions && allSessions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">User ID</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Subject</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Hours</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {allSessions.slice(0, 20).map((session) => (
                        <tr key={session.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-800 font-semibold">{session.userId}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{session.subject || "General"}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-indigo-600">
                            {session.hoursStudied} hrs
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(session.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                            {session.notes || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">No study sessions found</div>
              )}
            </Card>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard">
            <Card className="bg-white shadow-lg overflow-hidden">
              <div className="p-6 border-b-2 border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800">Top Performers</h2>
              </div>

              {stats?.topLeaderboardUsers && stats.topLeaderboardUsers.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {stats.topLeaderboardUsers.map((performer, index) => (
                    <div key={performer.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center gap-6 flex-1">
                        <div className="text-2xl font-bold text-indigo-600 w-12 text-center">#{index + 1}</div>
                        <div>
                          <p className="font-bold text-gray-800">User {performer.userId}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {performer.topicsCompleted} topics • {parseFloat(performer.totalHoursStudied as any).toFixed(1)} hrs
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-indigo-600">{performer.points}</p>
                        <p className="text-xs text-gray-500">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">No leaderboard data available</div>
              )}
            </Card>
          </TabsContent>

          {/* Certificates Management Tab */}
          <TabsContent value="certificates">
            <AdminCertificateManager />
          </TabsContent>

          {/* PDF Management Tab */}
          <TabsContent value="pdfs">
            <Card className="bg-white shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">PDF Management</h2>
                <Button
                  onClick={() => window.location.href = '/pdf-upload'}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Manage PDFs
                </Button>
              </div>
              <p className="text-gray-600">Click the button above to upload, edit, or delete PDF study materials.</p>
            </Card>
          </TabsContent>
        </Tabs>

        {/* User Details */}
        {selectedUser && userStats && (
          <Card className="bg-white shadow-lg p-6 mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <User className="w-6 h-6" />
                User Details - ID: {selectedUser}
              </h2>
              <Button variant="outline" onClick={() => setSelectedUser(null)}>
                Close
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 font-semibold">Total Sessions</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{userStats.totalSessions}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 font-semibold">Total Hours</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{userStats.totalHours.toFixed(1)}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 font-semibold">Topics Completed</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {userStats.topicsCompleted}/{userStats.totalTopics}
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 font-semibold">Avg Score</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{userStats.averageScore.toFixed(1)}%</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
