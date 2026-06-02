import React, { useState } from 'react';
import { Trophy, Medal, Flame } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  name: string;
  certificatesEarned: number;
  totalXP: number;
  streak: number;
  avatar: string;
}

export default function CertificateLeaderboard() {
  const [activeTab, setActiveTab] = useState<'certificates' | 'xp'>('certificates');

  // Mock leaderboard data
  const certificateLeaders: LeaderboardEntry[] = [
    { rank: 1, name: 'Arjun Kumar', certificatesEarned: 32, totalXP: 4250, streak: 45, avatar: '👨‍💻' },
    { rank: 2, name: 'Priya Singh', certificatesEarned: 28, totalXP: 3800, streak: 38, avatar: '👩‍💻' },
    { rank: 3, name: 'Rahul Patel', certificatesEarned: 25, totalXP: 3400, streak: 32, avatar: '👨‍🎓' },
    { rank: 4, name: 'Neha Sharma', certificatesEarned: 22, totalXP: 3100, streak: 28, avatar: '👩‍🎓' },
    { rank: 5, name: 'Aditya Gupta', certificatesEarned: 20, totalXP: 2900, streak: 25, avatar: '👨‍🏫' },
    { rank: 6, name: 'Isha Verma', certificatesEarned: 18, totalXP: 2600, streak: 22, avatar: '👩‍🏫' },
    { rank: 7, name: 'Vikram Singh', certificatesEarned: 16, totalXP: 2400, streak: 20, avatar: '🧑‍💼' },
    { rank: 8, name: 'Anjali Desai', certificatesEarned: 14, totalXP: 2100, streak: 18, avatar: '👩‍💼' },
    { rank: 9, name: 'Karan Malhotra', certificatesEarned: 12, totalXP: 1800, streak: 15, avatar: '🧑‍🎨' },
    { rank: 10, name: 'Divya Nair', certificatesEarned: 10, totalXP: 1500, streak: 12, avatar: '👩‍🎨' }
  ];

  const xpLeaders: LeaderboardEntry[] = [
    { rank: 1, name: 'Arjun Kumar', certificatesEarned: 32, totalXP: 4250, streak: 45, avatar: '👨‍💻' },
    { rank: 2, name: 'Priya Singh', certificatesEarned: 28, totalXP: 3800, streak: 38, avatar: '👩‍💻' },
    { rank: 3, name: 'Rahul Patel', certificatesEarned: 25, totalXP: 3400, streak: 32, avatar: '👨‍🎓' },
    { rank: 4, name: 'Neha Sharma', certificatesEarned: 22, totalXP: 3100, streak: 28, avatar: '👩‍🎓' },
    { rank: 5, name: 'Aditya Gupta', certificatesEarned: 20, totalXP: 2900, streak: 25, avatar: '👨‍🏫' },
    { rank: 6, name: 'Isha Verma', certificatesEarned: 18, totalXP: 2600, streak: 22, avatar: '👩‍🏫' },
    { rank: 7, name: 'Vikram Singh', certificatesEarned: 16, totalXP: 2400, streak: 20, avatar: '🧑‍💼' },
    { rank: 8, name: 'Anjali Desai', certificatesEarned: 14, totalXP: 2100, streak: 18, avatar: '👩‍💼' },
    { rank: 9, name: 'Karan Malhotra', certificatesEarned: 12, totalXP: 1800, streak: 15, avatar: '🧑‍🎨' },
    { rank: 10, name: 'Divya Nair', certificatesEarned: 10, totalXP: 1500, streak: 12, avatar: '👩‍🎨' }
  ];

  const leaderboard = activeTab === 'certificates' ? certificateLeaders : xpLeaders;

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-yellow-500';
      case 2:
        return 'text-gray-400';
      case 3:
        return 'text-orange-600';
      default:
        return 'text-slate-400';
    }
  };

  const getRowBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-50 border-l-4 border-yellow-400';
      case 2:
        return 'bg-gray-50 border-l-4 border-gray-400';
      case 3:
        return 'bg-orange-50 border-l-4 border-orange-400';
      default:
        return 'bg-white hover:bg-slate-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h1 className="text-4xl font-bold text-slate-900">Leaderboard</h1>
          </div>
          <p className="text-slate-600">See who's leading the way in Cognitrium Hub</p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('certificates')}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'certificates'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              🏆 Top by Certificates
            </button>
            <button
              onClick={() => setActiveTab('xp')}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'xp'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              ⭐ Top by XP
            </button>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Student</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Certificates</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Total XP</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Streak</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => (
                  <tr key={entry.rank} className={`border-b border-slate-200 transition-colors ${getRowBg(entry.rank)}`}>
                    {/* Rank */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {entry.rank <= 3 ? (
                          <Medal className={`w-6 h-6 ${getMedalColor(entry.rank)}`} />
                        ) : (
                          <span className="text-lg font-bold text-slate-400">{entry.rank}</span>
                        )}
                      </div>
                    </td>

                    {/* Student Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{entry.avatar}</span>
                        <div>
                          <p className="font-semibold text-slate-900">{entry.name}</p>
                          <p className="text-xs text-slate-500">Member</p>
                        </div>
                      </div>
                    </td>

                    {/* Certificates */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <span className="font-semibold text-slate-900">{entry.certificatesEarned}</span>
                      </div>
                    </td>

                    {/* XP */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg">⭐</span>
                        <span className="font-semibold text-slate-900">{entry.totalXP}</span>
                      </div>
                    </td>

                    {/* Streak */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Flame className="w-4 h-4 text-red-500" />
                        <span className="font-semibold text-slate-900">{entry.streak}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
            <p className="text-slate-600 text-sm font-semibold mb-1">Top Student</p>
            <p className="text-2xl font-bold text-slate-900">{leaderboard[0].name}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Medal className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <p className="text-slate-600 text-sm font-semibold mb-1">Average Certificates</p>
            <p className="text-2xl font-bold text-slate-900">
              {Math.round(leaderboard.reduce((sum, e) => sum + e.certificatesEarned, 0) / leaderboard.length)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Flame className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <p className="text-slate-600 text-sm font-semibold mb-1">Longest Streak</p>
            <p className="text-2xl font-bold text-slate-900">
              {Math.max(...leaderboard.map(e => e.streak))} days
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
