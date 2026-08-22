import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Download, Award, Loader2, CheckCircle, Sparkles, Trophy } from "lucide-react";
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

  const { data: userCerts, isLoading: isCertsLoading, refetch: refetchCerts } = trpc.certificates.getUserCertificates.useQuery();
  const { data: stats, isLoading: isStatsLoading } = trpc.certificates.getContributionStats.useQuery();

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

  const handleDownloadCertificate = async (cert: Certificate) => {
    try {
      const response = await fetch(`/api/trpc/certificates.downloadCertificate?input=${JSON.stringify({ certificateId: cert.id })}`);
      const result = await response.json();

      if (result.result?.data?.downloadUrl) {
        markDownloadedMutation.mutate({ certificateId: cert.id });

        const link = document.createElement("a");
        link.href = result.result.data.downloadUrl;
        link.download = result.result.data.fileName || `certificate-${cert.verificationCode}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Failed to download certificate:", error);
    }
  };

  if (isCertsLoading || isStatsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] space-y-8 animate-in fade-in duration-300">
      <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-accent/30 blur-3xl pointer-events-none" />
        <div className="relative">
          <p className="ink-kicker mb-3">Milestones & Verification</p>
          <h1 className="display-serif text-3xl font-bold tracking-tight sm:text-5xl">Your Earned Certificates</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">Download your verified credentials and share your study milestones with peers.</p>
        </div>
      </section>

      {stats && (
        <Card className="elevated-card rounded-[2rem] p-6 sm:p-8 space-y-6">
          <div>
            <p className="ink-kicker">Engagement Metrics</p>
            <h2 className="text-xl font-bold tracking-tight">Your Contribution Stats</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border/80 bg-background/50 p-5 space-y-1">
              <p className="text-xs font-black uppercase text-muted-foreground">Community Posts</p>
              <p className="text-3xl font-black text-foreground">{stats.postCount}</p>
            </div>
            <div className="rounded-2xl border border-border/80 bg-background/50 p-5 space-y-1">
              <p className="text-xs font-black uppercase text-muted-foreground">Likes Received</p>
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{stats.totalLikesReceived}</p>
            </div>
            <div className="rounded-2xl border border-border/80 bg-background/50 p-5 space-y-1">
              <p className="text-xs font-black uppercase text-muted-foreground">Helpful Replies</p>
              <p className="text-3xl font-black text-primary">{stats.replyCount}</p>
            </div>
            <div className="rounded-2xl border border-border/80 bg-background/50 p-5 space-y-1">
              <p className="text-xs font-black uppercase text-muted-foreground">Study Streak Days</p>
              <p className="text-3xl font-black text-amber-600">{stats.streakDays}</p>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          Earned Certificates ({certificates.length})
        </h2>
        {certificates.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {certificates.map((cert) => (
              <Card key={cert.id} className="elevated-card rounded-[2rem] p-6 sm:p-8 flex flex-col justify-between space-y-6 border border-border bg-card">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase text-primary">Verified Credential</span>
                    <Sparkles className="h-5 w-5 text-amber-500" />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-foreground">{cert.title}</h3>
                  <p className="text-xs font-semibold text-muted-foreground">{cert.contributionMetric}</p>
                </div>
                <div className="space-y-4 pt-4 border-t border-border/60">
                  <div className="text-xs font-semibold text-muted-foreground space-y-1">
                    <p>Issued: <span className="font-bold text-foreground">{new Date(cert.issuedAt).toLocaleDateString()}</span></p>
                    <p className="font-mono text-[0.7rem] text-muted-foreground">Code: {cert.verificationCode.substring(0, 12)}...</p>
                  </div>
                  <Button
                    onClick={() => handleDownloadCertificate(cert)}
                    className="w-full rounded-full font-bold shadow-sm"
                  >
                    <Download className="mr-2 h-4 w-4" /> Download Certificate
                  </Button>
                  {cert.isDownloaded && (
                    <p className="text-xs font-bold text-emerald-600 text-center">✓ Downloaded</p>
                  )}
                  <div className="pt-2">
                    <CertificateShareButtons
                      certificateTitle={cert.title}
                      certificateType={cert.certificateType}
                      verificationCode={cert.verificationCode}
                      certificateUrl={cert.certificateUrl}
                      studentName="Student"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="rounded-[2rem] p-12 text-center space-y-3 border border-dashed border-border bg-card">
            <Award className="mx-auto h-12 w-12 text-muted-foreground/60" />
            <p className="text-base font-bold text-foreground">No Certificates Yet</p>
            <p className="text-sm font-semibold text-muted-foreground max-w-md mx-auto">Participate in the community, complete study sessions, and maintain your streak to earn certificates!</p>
          </Card>
        )}
      </div>
    </div>
  );
}
