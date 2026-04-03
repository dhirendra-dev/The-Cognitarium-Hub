import { Award, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export function CertificateWidget() {
  const [, navigate] = useLocation();
  const { data: certificates, isLoading } = trpc.certificates.getUserCertificates.useQuery();

  if (isLoading) {
    return null;
  }

  const certificateCount = certificates?.length || 0;

  return (
    <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            <CardTitle>Certificates</CardTitle>
          </div>
          <Badge className="bg-amber-600 text-white">{certificateCount}</Badge>
        </div>
        <CardDescription>Earn certificates for community contributions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-gray-700">
            {certificateCount > 0
              ? `You've earned ${certificateCount} certificate${certificateCount !== 1 ? "s" : ""}! Keep contributing to earn more.`
              : "Start contributing to the community to earn your first certificate!"}
          </p>
          <Button
            onClick={() => navigate("/certificates")}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            size="sm"
          >
            View Certificates
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
