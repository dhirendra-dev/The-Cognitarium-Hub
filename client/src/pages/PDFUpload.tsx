import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Upload, FileText, Trash2, Search } from "lucide-react";

const SUBJECTS = ["Advanced Mathematics", "Science", "SST", "English", "Hindi", "Optional Subject"];
const MAX_FILE_SIZE = 400 * 1024 * 1024; // 400MB

export default function PDFUpload() {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("Advanced Mathematics");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // tRPC queries and mutations
  const { data: pdfs, refetch: refetchPDFs, isLoading } = trpc.pdf.getBySubject.useQuery({
    subject: selectedSubject,
    limit: 50,
  });

  const uploadMutation = trpc.pdf.upload.useMutation({
    onSuccess: () => {
      toast.success("PDF uploaded successfully!");
      setSelectedFile(null);
      setTitle("");
      setDescription("");
      setUploadProgress(0);
      refetchPDFs();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to upload PDF");
      setUploadProgress(0);
    },
  });

  const deleteMutation = trpc.pdf.delete.useMutation({
    onSuccess: () => {
      toast.success("PDF deleted successfully!");
      refetchPDFs();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete PDF");
    },
  });

  // Check if user is admin
  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
            <p className="text-gray-600">Only administrators can upload PDFs.</p>
          </Card>
        </div>
      </div>
    );
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please select a PDF file");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File size exceeds 400MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !title) {
      toast.error("Please select a file and enter a title");
      return;
    }

    try {
      setUploadProgress(50);

      // Read file as base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(",")[1];

        try {
          setUploadProgress(75);

          // For now, we'll create a mock file URL
          // In production, this would upload to S3
          const fileUrl = `https://storage.example.com/pdfs/${Date.now()}-${selectedFile.name}`;
          const fileKey = `pdfs/${Date.now()}-${selectedFile.name}`;

          setUploadProgress(90);

          // Create PDF document record
          await uploadMutation.mutateAsync({
            title,
            description,
            fileKey: fileKey,
            fileUrl: fileUrl,
            fileSize: selectedFile.size,
            subject: selectedSubject,
          });

          setUploadProgress(100);
        } catch (error: any) {
          toast.error(error.message || "Failed to upload file to storage");
          setUploadProgress(0);
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch (error: any) {
      toast.error(error.message || "Failed to process file");
      setUploadProgress(0);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) {
      refetchPDFs();
      return;
    }
    // Search is handled by the search query
    // For now, just show a toast
    toast.info("Searching for: " + searchQuery);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Upload className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">PDF Management</h1>
          </div>
          <p className="text-gray-600">Upload and manage study material PDFs (max 400MB per file)</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <Card className="bg-white shadow-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Upload PDF</h2>

              {/* Subject Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {SUBJECTS.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="PDF title"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  maxLength={255}
                />
              </div>

              {/* Description Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
              </div>

              {/* File Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select PDF File</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>

              {/* Progress Bar */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{uploadProgress}%</p>
                </div>
              )}

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || !title || uploadMutation.isPending}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {uploadMutation.isPending ? "Uploading..." : "Upload PDF"}
              </Button>
            </Card>
          </div>

          {/* PDFs List */}
          <div className="lg:col-span-2">
            {/* Search Bar */}
            <Card className="bg-white shadow-lg p-6 mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search PDFs..."
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Button
                  onClick={() => {
                    if (searchQuery) {
                      toast.info("Searching for: " + searchQuery);
                    } else {
                      refetchPDFs();
                    }
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </Card>

            {/* PDFs Grid */}
            {isLoading ? (
              <Card className="bg-white shadow-lg p-8 text-center">
                <p className="text-gray-600">Loading PDFs...</p>
              </Card>
            ) : pdfs && pdfs.length > 0 ? (
              <div className="space-y-4">
                {pdfs.map((pdf: any) => (
                  <Card key={pdf.id} className="bg-white shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-5 h-5 text-red-500" />
                          <h3 className="text-lg font-bold text-gray-800">{pdf.title}</h3>
                        </div>
                        {pdf.description && (
                          <p className="text-sm text-gray-600 mb-2">{pdf.description}</p>
                        )}
                        <div className="flex gap-4 text-sm text-gray-500">
                          <span>Subject: {pdf.subject}</span>
                          <span>Size: {formatFileSize(pdf.fileSize)}</span>
                          <span>Downloads: {pdf.downloadCount}</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => deleteMutation.mutate({ id: pdf.id })}
                        disabled={deleteMutation.isPending}
                        className="bg-red-600 hover:bg-red-700 text-white ml-4"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-white shadow-lg p-8 text-center">
                <p className="text-gray-600">No PDFs found for this subject</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
