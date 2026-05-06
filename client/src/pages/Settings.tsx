import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";

export default function Settings() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dailyGoal, setDailyGoal] = useState("4");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dailyReminderTime, setDailyReminderTime] = useState("08:00");
  const [dashboardLayout, setDashboardLayout] = useState("grid");

  // tRPC queries and mutations
  const { data: preferences } = trpc.preferences.get.useQuery();
  const updatePreferencesMutation = trpc.preferences.update.useMutation({
    onSuccess: () => {
      toast.success("Settings saved successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save settings");
    },
  });

  // Load preferences on mount
  useEffect(() => {
    if (preferences) {
      setNotificationsEnabled(preferences.notificationsEnabled ?? true);
      setDailyReminderTime(preferences.dailyReminderTime || "08:00");
      setDashboardLayout(preferences.dashboardLayout || "grid");
    }
  }, [preferences]);

  const handleSaveSettings = async () => {
    updatePreferencesMutation.mutate({
      notificationsEnabled,
      dailyReminderTime,
      dashboardLayout,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <SettingsIcon className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-800">Settings</h1>
          </div>
          <p className="text-gray-600">Customize your study experience</p>
        </div>

        {/* User Profile Section */}
        <Card className="bg-white shadow-lg mb-8 p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile Information</h2>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-semibold text-gray-700">Name</Label>
              <p className="mt-2 text-lg text-gray-800">{user?.name || "Not set"}</p>
            </div>
            <div>
              <Label className="text-sm font-semibold text-gray-700">Email</Label>
              <p className="mt-2 text-lg text-gray-800">{user?.email || "Not set"}</p>
            </div>
            <div>
              <Label className="text-sm font-semibold text-gray-700">Member Since</Label>
              <p className="mt-2 text-lg text-gray-800">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Not available"}
              </p>
            </div>
          </div>
        </Card>

        {/* Study Goals */}
        <Card className="bg-white shadow-lg mb-8 p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Study Goals</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="daily-goal" className="text-sm font-semibold text-gray-700">
                Daily Study Goal (Hours)
              </Label>
              <Input
                id="daily-goal"
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(e.target.value)}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-2">
                Set a realistic daily study goal to track your progress
              </p>
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-white shadow-lg mb-8 p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Notifications</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-semibold text-gray-700">Enable Notifications</Label>
                <p className="text-xs text-gray-500 mt-1">
                  Receive daily reminders and study alerts
                </p>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>

            {notificationsEnabled && (
              <div>
                <Label htmlFor="reminder-time" className="text-sm font-semibold text-gray-700">
                  Daily Reminder Time
                </Label>
                <Input
                  id="reminder-time"
                  type="time"
                  value={dailyReminderTime}
                  onChange={(e) => setDailyReminderTime(e.target.value)}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-2">
                  You'll receive a daily study reminder at this time
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Display Settings */}
        <Card className="bg-white shadow-lg mb-8 p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Display</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-semibold text-gray-700">Theme</Label>
                <p className="text-xs text-gray-500 mt-1">
                  {theme === "light" ? "Light Mode" : "Dark Mode"}
                </p>
              </div>
              <Button
                onClick={toggleTheme}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                {theme === "light" ? (
                  <>
                    <Moon className="w-4 h-4" />
                    Dark
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4" />
                    Light
                  </>
                )}
              </Button>
            </div>

            <div>
              <Label htmlFor="layout" className="text-sm font-semibold text-gray-700">
                Dashboard Layout
              </Label>
              <select
                id="layout"
                value={dashboardLayout}
                onChange={(e) => setDashboardLayout(e.target.value)}
                className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="grid">Grid View</option>
                <option value="list">List View</option>
                <option value="compact">Compact View</option>
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Choose how your dashboard displays information
              </p>
            </div>
          </div>
        </Card>

        {/* Study Preferences */}
        <Card className="bg-white shadow-lg mb-8 p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Academic Preferences</h2>
          <div className="space-y-6">
            {/* Board Selection */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-3 block">Select Your Board</Label>
              <div className="grid grid-cols-3 gap-3">
                {['CBSE', 'HSLC', 'MP Board'].map((board) => (
                  <button
                    key={board}
                    className="p-3 border-2 border-gray-300 rounded-lg hover:border-indigo-500 transition-all font-medium text-sm"
                  >
                    {board}
                  </button>
                ))}
              </div>
            </div>

            {/* Stream Selection */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-3 block">Select Your Stream</Label>
              <div className="grid grid-cols-3 gap-3">
                {['Science', 'Commerce', 'Arts'].map((stream) => (
                  <button
                    key={stream}
                    className="p-3 border-2 border-gray-300 rounded-lg hover:border-indigo-500 transition-all font-medium text-sm"
                  >
                    {stream}
                  </button>
                ))}
              </div>
            </div>

            {/* Class Selection */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-3 block">Select Your Class</Label>
              <div className="grid grid-cols-2 gap-3">
                {['11', '12'].map((cls) => (
                  <button
                    key={cls}
                    className="p-3 border-2 border-gray-300 rounded-lg hover:border-indigo-500 transition-all font-medium text-sm"
                  >
                    Class {cls}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <p className="text-sm text-gray-700">
                <strong>Tip:</strong> Customize your subjects, study schedule, and goals from the respective pages. 
                You can add custom subjects, modify the Advanced Mathematics study plan, and track daily tasks according to your needs.
              </p>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex gap-4">
          <Button
            onClick={handleSaveSettings}
            disabled={updatePreferencesMutation.isPending}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-6 text-lg"
          >
            {updatePreferencesMutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </div>

        {/* Help Section */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg mt-8 p-6 border-2 border-blue-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Need Help?</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Visit the Dashboard to log your daily study hours and track progress</li>
            <li>• Use the Subjects page to organize topics and mark completion</li>
            <li>• Follow the Math Study Plan for a structured Advanced Mathematics revision</li>
            <li>• Track daily tasks for SST and Science revision</li>
            <li>• Get personalized tips and practice questions from the AI Assistant</li>
            <li>• Read the About section for motivation and guidance</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
