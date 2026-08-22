import { Share2, Linkedin, Twitter, Facebook, Mail, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface CertificateShareButtonsProps {
  certificateTitle: string;
  certificateType: string;
  verificationCode: string;
  certificateUrl: string;
  studentName: string;
}

export function CertificateShareButtons({
  certificateTitle,
  certificateType,
  verificationCode,
  certificateUrl,
  studentName,
}: CertificateShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `🎓 I just earned the "${certificateTitle}" certificate from The Cognitarium Hub! This recognizes my commitment to community learning and academic excellence.`;
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const verificationText = `Verification Code: ${verificationCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(certificateUrl);
    setCopied(true);
    toast.success("Certificate link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareLinkedIn = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      certificateUrl
    )}`;
    window.open(linkedinUrl, "_blank", "width=600,height=400");
  };

  const handleShareTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}&url=${encodeURIComponent(certificateUrl)}&hashtags=BoardExam,Certificate,Learning`;
    window.open(twitterUrl, "_blank", "width=600,height=400");
  };

  const handleShareFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      certificateUrl
    )}`;
    window.open(facebookUrl, "_blank", "width=600,height=400");
  };

  const handleShareEmail = () => {
    const emailSubject = `Check out my ${certificateTitle} Certificate!`;
    const emailBody = `Hi,\n\n${shareText}\n\nYou can view my certificate here: ${certificateUrl}\n\n${verificationText}\n\nJoin me on The Cognitarium Hub!\n\nBest regards,\n${studentName}`;
    const mailtoLink = `mailto:?subject=${encodeURIComponent(
      emailSubject
    )}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoLink;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Share2 className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">Share Your Achievement</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {/* LinkedIn */}
        <Button
          onClick={handleShareLinkedIn}
          className="bg-blue-700 hover:bg-blue-800 text-white flex items-center justify-center gap-2"
          size="sm"
          title="Share on LinkedIn"
        >
          <Linkedin className="w-4 h-4" />
          <span className="hidden sm:inline">LinkedIn</span>
        </Button>

        {/* Twitter */}
        <Button
          onClick={handleShareTwitter}
          className="bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center gap-2"
          size="sm"
          title="Share on Twitter"
        >
          <Twitter className="w-4 h-4" />
          <span className="hidden sm:inline">Twitter</span>
        </Button>

        {/* Facebook */}
        <Button
          onClick={handleShareFacebook}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
          size="sm"
          title="Share on Facebook"
        >
          <Facebook className="w-4 h-4" />
          <span className="hidden sm:inline">Facebook</span>
        </Button>

        {/* Email */}
        <Button
          onClick={handleShareEmail}
          className="bg-red-500 hover:bg-red-600 text-white flex items-center justify-center gap-2"
          size="sm"
          title="Share via Email"
        >
          <Mail className="w-4 h-4" />
          <span className="hidden sm:inline">Email</span>
        </Button>

        {/* Copy Link */}
        <Button
          onClick={handleCopyLink}
          className="bg-gray-600 hover:bg-gray-700 text-white flex items-center justify-center gap-2"
          size="sm"
          title="Copy certificate link"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span className="hidden sm:inline">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span className="hidden sm:inline">Copy</span>
            </>
          )}
        </Button>
      </div>

      <div className="text-xs text-gray-600 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <p className="font-semibold mb-1">Share Message:</p>
        <p className="italic">{shareText}</p>
      </div>
    </div>
  );
}
