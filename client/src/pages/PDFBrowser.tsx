import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Download, FileText, Eye } from "lucide-react";

const SUBJECTS = ["Advanced Mathematics", "Science", "SST", "English", "Hindi", "Optional Subject"];

export default function PDFBrowser() {
  const { user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState("Advanced Mathematics");
  const [selectedPDF, setSelectedPDF] = useState<any | null>(null);

  // tRPC queries
  const { data: pdfs, isLoading } = trpc.pdf.getBySubject.useQuery({
    subject: selectedSubject,
    limit: 50,
  });

  const downloadMutation = trpc.pdf.incrementDownloadCount.useMutation({
    onSuccess: () => {
      toast.success("Download started!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to record download");
    },
  });

  const handleDownload = (pdf: any) => {
    // Record the download
    downloadMutation.mutate({ id: pdf.id });
    
    // Open the PDF in a new tab
    window.open(pdf.fileUrl, "_blank");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">Study Materials</h1>
          </div>
          <p className="text-gray-600">Download PDF study materials for your subjects</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Subject Selection */}
          <div className="lg:col-span-1">
            <Card className="bg-white shadow-lg p-6 sticky top-4">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Subjects</h2>
              <div className="space-y-2">
                {SUBJECTS.map((subject) => (
                  <button
                    key={subject}
                    onClick={() => setSelectedSubject(subject)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedSubject === subject
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Content - PDFs List */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <Card className="bg-white shadow-lg p-8 text-center">
                <p className="text-gray-600">Loading study materials...</p>
              </Card>
            ) : pdfs && pdfs.length > 0 ? (
              <div className="space-y-4">
                {pdfs.map((pdf: any) => (
                  <Card
                    key={pdf.id}
                    className="bg-white shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => setSelectedPDF(pdf)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-red-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-800">{pdf.title}</h3>
                            <p className="text-sm text-gray-500">
                              {formatDate(pdf.createdAt)} • {formatFileSize(pdf.fileSize)}
                            </p>
                          </div>
                        </div>

                        {pdf.description && (
                          <p className="text-gray-600 text-sm mb-3">{pdf.description}</p>
                        )}

                        <div className="flex gap-4 text-sm text-gray-500 mb-4">
                          <span className="flex items-center gap-1">
                            <Download className="w-4 h-4" />
                            {pdf.downloadCount} downloads
                          </span>
                          <span>Subject: {pdf.subject}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(pdf.fileUrl, "_blank");
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(pdf);
                          }}
                          disabled={downloadMutation.isPending}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-white shadow-lg p-8 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No study materials available for this subject yet</p>
                <p className="text-gray-500 text-sm mt-2">Check back later for more resources</p>
              </Card>
            )}
          </div>
        </div>

        {/* PDF Preview Modal */}
        {selectedPDF && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedPDF(null)}
          >
            <Card className="bg-white shadow-2xl max-w-2xl w-full max-h-96 overflow-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">{selectedPDF.title}</h2>
                  <button
                    onClick={() => setSelectedPDF(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {selectedPDF.description && (
                  <p className="text-gray-600 mb-4">{selectedPDF.description}</p>
                )}

                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div>
                    <p className="text-gray-500">Subject</p>
                    <p className="font-semibold text-gray-800">{selectedPDF.subject}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">File Size</p>
                    <p className="font-semibold text-gray-800">{formatFileSize(selectedPDF.fileSize)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Downloads</p>
                    <p className="font-semibold text-gray-800">{selectedPDF.downloadCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Uploaded</p>
                    <p className="font-semibold text-gray-800">{formatDate(selectedPDF.createdAt)}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      window.open(selectedPDF.fileUrl, "_blank");
                      setSelectedPDF(null);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View PDF
                  </Button>
                  <Button
                    onClick={() => {
                      handleDownload(selectedPDF);
                      setSelectedPDF(null);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
