import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Download, Award, Loader2, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Certificate {
  id: number;
  certificateType: string;
  title: string;
  description?: string;
  contributionMetric?: string;
  certificateUrl: string;
  verificationCode: string;
  isDownloaded: boolean;
  issuedAt: Date;
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCertType, setSelectedCertType] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch user certificates
  const { data: userCerts, isLoading: isCertsLoading, refetch: refetchCerts } = trpc.certificates.getUserCertificates.useQuery();

  // Fetch contribution stats
  const { data: stats, isLoading: isStatsLoading } = trpc.certificates.getContributionStats.useQuery();

  // Generate certificate mutation
  const generateCertMutation = trpc.certificates.generateCertificate.useMutation({
    onSuccess: (data) => {
      setIsGenerating(false);
      setSelectedCertType(null);
      refetchCerts();
    },
    onError: (error) => {
      setIsGenerating(false);
      console.error("Certificate generation failed:", error);
    },
  });

  // Mark as downloaded mutation
  const markDownloadedMutation = trpc.certificates.markAsDownloaded.useMutation({
    onSuccess: () => {
      refetchCerts();
    },
  });

  useEffect(() => {
    if (userCerts) {
      setCertificates(userCerts as Certificate[]);
    }
  }, [userCerts]);

  const certificateTypes = [
    {
      id: "activeMember",
      name: "Active Community Member",
      description: "5+ posts with 10+ likes",
      icon: "👥",
      color: "bg-blue-100 text-blue-800",
    },
    {
      id: "topContributor",
      name: "Top Community Contributor",
      description: "20+ posts with 100+ likes",
      icon: "⭐",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      id: "helpfulCommunity",
      name: "Helpful Community Member",
      description: "50+ helpful replies",
      icon: "🤝",
      color: "bg-green-100 text-green-800",
    },
    {
      id: "consistentLearner",
      name: "Consistent Learner",
      description: "100+ study hours, 30-day streak",
      icon: "📚",
      color: "bg-purple-100 text-purple-800",
    },
    {
      id: "leaderboardTop10",
      name: "Leaderboard Top 10",
      description: "Ranked in top 10 students",
      icon: "🏆",
      color: "bg-orange-100 text-orange-800",
    },
    {
      id: "courseCompletion",
      name: "Course Completion",
      description: "Completed a full course",
      icon: "🎓",
      color: "bg-indigo-100 text-indigo-800",
    },
    {
      id: "quizMastery",
      name: "Quiz Mastery",
      description: "90%+ score on quizzes",
      icon: "💯",
      color: "bg-pink-100 text-pink-800",
    },
    {
      id: "studyStreak",
      name: "Study Streak Champion",
      description: "60-day streak with 200+ hours",
      icon: "🔥",
      color: "bg-red-100 text-red-800",
    },
  ];

  const handleGenerateCertificate = async (certType: string) => {
    setIsGenerating(true);
    setSelectedCertType(certType);
    try {
      await generateCertMutation.mutateAsync({
        certificateType: certType as any,
      });
    } catch (error) {
      console.error("Error generating certificate:", error);
    }
  };

  const handleDownloadCertificate = (cert: Certificate) => {
    // Mark as downloaded
    markDownloadedMutation.mutate({ certificateId: cert.id });
    // Trigger download
    const link = document.createElement("a");
    link.href = cert.certificateUrl;
    link.download = `certificate-${cert.verificationCode}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasCertificate = (certType: string) => {
    return certificates.some((c) => c.certificateType === certType);
  };

  if (isCertsLoading || isStatsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Award className="w-10 h-10 text-blue-600" />
            Your Certificates
          </h1>
          <p className="text-gray-600">
            Earn certificates by contributing to the community and maintaining consistent study habits.
          </p>
        </div>

        {/* Contribution Stats */}
        {stats && (
          <Card className="mb-8 border-2 border-blue-200 bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Your Contribution Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.postCount}</div>
                  <div className="text-sm text-gray-600">Community Posts</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.totalLikesReceived}</div>
                  <div className="text-sm text-gray-600">Likes Received</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{stats.replyCount}</div>
                  <div className="text-sm text-gray-600">Helpful Replies</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{stats.streakDays}</div>
                  <div className="text-sm text-gray-600">Study Streak Days</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Earned Certificates */}
        {certificates.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Earned Certificates ({certificates.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((cert) => (
                <Card key={cert.id} className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{cert.title}</CardTitle>
                    <CardDescription>{cert.contributionMetric}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Badge className="bg-green-600 text-white">
                        Earned on {new Date(cert.issuedAt).toLocaleDateString()}
                      </Badge>
                      <div className="text-sm text-gray-600">
                        <strong>Verification Code:</strong> {cert.verificationCode.substring(0, 8)}...
                      </div>
                      <Button
                        onClick={() => handleDownloadCertificate(cert)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Certificate
                      </Button>
                      {cert.isDownloaded && (
                        <div className="text-xs text-green-600 text-center">✓ Downloaded</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Available Certificates */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Certificates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {certificateTypes.map((certType) => {
              const earned = hasCertificate(certType.id);
              return (
                <Card
                  key={certType.id}
                  className={`transition-all ${
                    earned
                      ? "border-green-300 bg-green-50 opacity-60"
                      : "border-gray-200 hover:border-blue-400 hover:shadow-lg"
                  }`}
                >
                  <CardHeader>
                    <div className="text-4xl mb-2">{certType.icon}</div>
                    <CardTitle className="text-base">{certType.name}</CardTitle>
                    <CardDescription className="text-xs">{certType.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {earned ? (
                      <Badge className="w-full justify-center bg-green-600 text-white">
                        ✓ Earned
                      </Badge>
                    ) : (
                      <Button
                        onClick={() => handleGenerateCertificate(certType.id)}
                        disabled={isGenerating && selectedCertType === certType.id}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        size="sm"
                      >
                        {isGenerating && selectedCertType === certType.id ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          "Earn Now"
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Error Alert */}
        {generateCertMutation.isError && (
          <Alert className="mt-6 border-red-300 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {generateCertMutation.error?.message || "Failed to generate certificate. Please try again."}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
