import React, { useState } from 'react';
import { Download, Share2, Award, TrendingUp } from 'lucide-react';

interface EarnedCertificate {
  id: string;
  certificateId: string;
  earnedDate: string;
  xpEarned: number;
  title: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  category: string;
  xpReward: number;
}

export default function MyCertificates() {
  // Mock earned certificates - in production, fetch from backend
  const [earnedCerts] = useState<EarnedCertificate[]>([]);

  const totalXP = earnedCerts.reduce((sum, cert) => {
    return sum + (cert.xpReward || 0);
  }, 0);

  const nextMilestone = 500; // XP needed for next achievement
  const progressPercent = (totalXP / nextMilestone) * 100;

  const handleShare = (cert: EarnedCertificate) => {
    const message = `🎉 I just earned the "${cert.title}" certificate on Cognitrium Hub! Check it out and join me on this learning journey. 📚`;
    
    // Share to WhatsApp
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleDownload = (cert: EarnedCertificate) => {
    // In production, generate and download PDF
    alert('Download feature coming soon!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">My Certificates</h1>
          <p className="text-slate-600">Track your achievements and progress</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Certificates */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 font-semibold">Certificates Earned</h3>
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{earnedCerts.length}</p>
            <p className="text-sm text-slate-500 mt-2">of 50 available</p>
          </div>

          {/* Total XP */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 font-semibold">Total XP Earned</h3>
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{totalXP}</p>
            <p className="text-sm text-slate-500 mt-2">XP Points</p>
          </div>

          {/* Completion Rate */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 font-semibold">Completion</h3>
              <span className="text-2xl font-bold text-purple-600">{Math.round((earnedCerts.length / 50) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${(earnedCerts.length / 50) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Progress to Next Milestone */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Progress to Next Milestone</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-slate-700">{totalXP} / {nextMilestone} XP</span>
              <span className="text-sm text-slate-600">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all"
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-slate-600 mt-2">
              {nextMilestone - totalXP > 0
                ? `Earn ${nextMilestone - totalXP} more XP to reach the next milestone!`
                : 'Congratulations! You have reached the milestone!'}
            </p>
          </div>
        </div>

        {/* Earned Certificates */}
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">Earned Certificates</h2>
          
          {earnedCerts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Award className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 text-lg">No certificates earned yet</p>
              <p className="text-slate-500 text-sm mt-2">Start your learning journey to earn your first certificate!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {earnedCerts.map((earnedCert) => {
                return (
                  <div key={earnedCert.certificateId} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{earnedCert.icon}</div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">{earnedCert.title}</h3>
                          <p className="text-sm text-slate-600">{earnedCert.description}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        earnedCert.tier === 'bronze' ? 'bg-orange-100 text-orange-800' :
                        earnedCert.tier === 'silver' ? 'bg-gray-100 text-gray-800' :
                        earnedCert.tier === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {earnedCert.tier.charAt(0).toUpperCase() + earnedCert.tier.slice(1)}
                      </span>
                    </div>

                    {/* Certificate Details */}
                    <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-slate-50 rounded-lg">
                      <div>
                        <p className="text-xs text-slate-600 font-semibold">Certificate ID</p>
                        <p className="text-sm font-mono text-slate-900">{earnedCert.certificateId}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 font-semibold">Earned On</p>
                        <p className="text-sm text-slate-900">{new Date(earnedCert.earnedDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 font-semibold">XP Reward</p>
                        <p className="text-sm font-bold text-blue-600">{earnedCert.xpReward} XP</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 font-semibold">Category</p>
                        <p className="text-sm text-slate-900">{earnedCert.category}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownload(earnedCert)}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      <button
                        onClick={() => handleShare(earnedCert)}
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
