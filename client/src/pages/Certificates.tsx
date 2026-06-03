import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Download, Award, Loader2, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CertificateShareButtons } from "@/components/CertificateShareButtons";

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

  // Fetch user certificates
  const { data: userCerts, isLoading: isCertsLoading, refetch: refetchCerts } = trpc.certificates.getUserCertificates.useQuery();

  // Fetch contribution stats
  const { data: stats, isLoading: isStatsLoading } = trpc.certificates.getContributionStats.useQuery();

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
            Download your earned certificates and share them with others.
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
        {certificates.length > 0 ? (
          <div>
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
                      <div className="border-t border-green-200 pt-3 mt-3">
                        <CertificateShareButtons
                          certificateTitle={cert.title}
                          certificateType={cert.certificateType}
                          verificationCode={cert.verificationCode}
                          certificateUrl={cert.certificateUrl}
                          studentName="Student"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Card className="border-2 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-600" />
                No Certificates Yet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                You haven't earned any certificates yet. Participate in the community, complete study sessions, and maintain your streak to earn certificates!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
