import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Award, Loader2, Trash2, BarChart3 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

export function AdminCertificateManager() {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedCertType, setSelectedCertType] = useState<string>("");
  const [awardReason, setAwardReason] = useState("");
  const [isAwarding, setIsAwarding] = useState(false);

  // Queries
  const { data: users, isLoading: usersLoading } = trpc.certificates.getAllUsersForAward.useQuery();
  const { data: stats, isLoading: statsLoading } = trpc.certificates.getStats.useQuery();
  const { data: allCerts, refetch: refetchCerts } = trpc.certificates.getAllCertificates.useQuery();

  // Mutations
  const awardMutation = trpc.certificates.awardManually.useMutation({
    onSuccess: () => {
      toast.success("Certificate awarded successfully!");
      setSelectedUserId("");
      setSelectedCertType("");
      setAwardReason("");
      setIsAwarding(false);
      refetchCerts();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to award certificate");
      setIsAwarding(false);
    },
  });

  const deleteMutation = trpc.certificates.delete.useMutation({
    onSuccess: () => {
      toast.success("Certificate deleted");
      refetchCerts();
    },
    onError: () => {
      toast.error("Failed to delete certificate");
    },
  });

  const revokeMutation = trpc.certificates.revoke.useMutation({
    onSuccess: () => {
      toast.success("Certificate revoked");
      refetchCerts();
    },
    onError: () => {
      toast.error("Failed to revoke certificate");
    },
  });

  const handleAwardCertificate = async () => {
    if (!selectedUserId || !selectedCertType || !awardReason) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsAwarding(true);
    try {
      await awardMutation.mutateAsync({
        userId: parseInt(selectedUserId),
        certificateType: selectedCertType,
        reason: awardReason,
      });
    } catch (error) {
      console.error("Error awarding certificate:", error);
    }
  };

  const certificateTypes = [
    "activeMember",
    "topContributor",
    "helpfulCommunity",
    "consistentLearner",
    "leaderboardTop10",
    "courseCompletion",
    "quizMastery",
    "studyStreak",
  ];

  if (usersLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      {stats && (
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <CardTitle>Certificate Statistics</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                <div className="text-3xl font-bold text-blue-600">{stats.totalCertificates}</div>
                <div className="text-sm text-gray-600">Total Certificates</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                <div className="text-3xl font-bold text-green-600">{stats.totalDownloads}</div>
                <div className="text-sm text-gray-600">Downloads</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
                <div className="text-3xl font-bold text-purple-600">{stats.usersWithCertificates}</div>
                <div className="text-sm text-gray-600">Users</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-orange-200">
                <div className="text-3xl font-bold text-orange-600">
                  {stats.certificatesByType?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Types</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Award Certificate Form */}
      <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            <CardTitle>Award Certificate Manually</CardTitle>
          </div>
          <CardDescription>Give a student a certificate for special achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* User Selection */}
            <div>
              <Label htmlFor="user-select">Select Student</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger id="user-select">
                  <SelectValue placeholder="Choose a student..." />
                </SelectTrigger>
                <SelectContent>
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Certificate Type Selection */}
            <div>
              <Label htmlFor="cert-type">Certificate Type</Label>
              <Select value={selectedCertType} onValueChange={setSelectedCertType}>
                <SelectTrigger id="cert-type">
                  <SelectValue placeholder="Choose certificate type..." />
                </SelectTrigger>
                <SelectContent>
                  {certificateTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/([A-Z])/g, " $1").trim()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Award Reason */}
            <div>
              <Label htmlFor="reason">Reason for Award</Label>
              <Textarea
                id="reason"
                placeholder="Explain why this student is receiving this certificate..."
                value={awardReason}
                onChange={(e) => setAwardReason(e.target.value)}
                className="min-h-24"
              />
            </div>

            <Button
              onClick={handleAwardCertificate}
              disabled={isAwarding || !selectedUserId || !selectedCertType || !awardReason}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isAwarding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Awarding...
                </>
              ) : (
                <>
                  <Award className="w-4 h-4 mr-2" />
                  Award Certificate
                </>
              )}
            </Button>

            {awardMutation.isError && (
              <Alert className="border-red-300 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {awardMutation.error?.message}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* All Certificates List */}
      <Card className="border-2 border-gray-200">
        <CardHeader>
          <CardTitle>All Certificates</CardTitle>
          <CardDescription>Manage all issued certificates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {allCerts && allCerts.length > 0 ? (
              allCerts.map((cert: any) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{cert.title}</div>
                    <div className="text-sm text-gray-600">
                      User ID: {cert.userId} | Type: {cert.certificateType}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Issued: {new Date(cert.issuedAt).toLocaleDateString()}
                      {cert.isDownloaded && " • Downloaded"}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        revokeMutation.mutate({
                          userId: cert.userId,
                          certificateType: cert.certificateType,
                        });
                      }}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No certificates issued yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
