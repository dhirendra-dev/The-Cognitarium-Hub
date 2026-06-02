import React, { useState } from 'react';
import { Key, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface UserOption {
  id: number;
  name: string | null;
  email: string | null;
  role: 'user' | 'admin';
}

export default function AdminPasswordReset() {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch all users
  const { data: users = [], isLoading: usersLoading } = trpc.admin.getAllUsersForPasswordReset.useQuery();

  // Reset password mutation
  const resetPasswordMutation = trpc.admin.resetUserPassword.useMutation({
    onSuccess: (data) => {
      setSuccessMessage(data.message || 'Password reset successfully!');
      setNewPassword('');
      setConfirmPassword('');
      setSelectedUserId(null);
      setTimeout(() => setSuccessMessage(''), 5000);
    },
    onError: (error) => {
      setErrorMessage(error.message || 'Failed to reset password');
      setTimeout(() => setErrorMessage(''), 5000);
    },
  });

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUserId) {
      setErrorMessage('Please select a user');
      return;
    }

    if (!newPassword.trim()) {
      setErrorMessage('Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    resetPasswordMutation.mutate({
      userId: selectedUserId,
      newPassword: newPassword,
    });
  };

  const selectedUser = users.find(u => u.id === selectedUserId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Key className="w-8 h-8 text-red-600" />
            <h1 className="text-4xl font-bold text-slate-900">Password Reset</h1>
          </div>
          <p className="text-slate-600">Reset user passwords for members who forgot theirs</p>
        </div>

        {/* Alert Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{errorMessage}</p>
          </div>
        )}

        {/* Main Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleResetPassword} className="space-y-6">
            {/* User Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4" />
                  Select User
                </div>
              </label>

              {usersLoading ? (
                <div className="p-4 text-center text-slate-600">Loading users...</div>
              ) : (
                <select
                  value={selectedUserId || ''}
                  onChange={(e) => {
                    setSelectedUserId(e.target.value ? parseInt(e.target.value) : null);
                    setErrorMessage('');
                  }}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">-- Select a user --</option>
                  {users.map((user: UserOption) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Selected User Info */}
            {selectedUser && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Selected User:</strong> {selectedUser.name} ({selectedUser.email})
                </p>
                <p className="text-sm text-blue-900 mt-1">
                  <strong>Role:</strong> {selectedUser.role}
                </p>
              </div>
            )}

            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  New Password
                </div>
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="Enter new password (minimum 6 characters)"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <p className="text-xs text-slate-500 mt-1">Minimum 6 characters required</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Confirm Password
                </div>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="Confirm new password"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Password Match Indicator */}
            {newPassword && confirmPassword && (
              <div className={`p-3 rounded-lg ${
                newPassword === confirmPassword
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                <p className="text-sm font-medium">
                  {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={resetPasswordMutation.isPending || !selectedUserId || !newPassword || newPassword !== confirmPassword}
              className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4" />
              {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          {/* Warning */}
          <div className="mt-8 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-900">
              <strong>⚠️ Important:</strong> After resetting the password, make sure to inform the user of their new password through a secure channel. Consider asking them to change it on their first login.
            </p>
          </div>
        </div>

        {/* Users List */}
        {users.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">All Users</h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.map((user: UserOption) => (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm text-slate-900">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date().toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
