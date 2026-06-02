import React, { useState, useRef } from 'react';
import { Download, Eye, Loader } from 'lucide-react';
import { CERTIFICATES, generateCertificateId } from '@/data/certificates';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface CertificateData {
  studentName: string;
  certificateType: string;
  dateIssued: string;
  certificateId: string;
}

export default function CertificateGenerator() {
  const [formData, setFormData] = useState<CertificateData>({
    studentName: '',
    certificateType: CERTIFICATES[0].id,
    dateIssued: new Date().toISOString().split('T')[0],
    certificateId: generateCertificateId()
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const selectedCertificate = CERTIFICATES.find(c => c.id === formData.certificateType);

  const handleGeneratePDF = async () => {
    if (!formData.studentName.trim()) {
      alert('Please enter student name');
      return;
    }

    setIsGenerating(true);
    try {
      if (!certificateRef.current) return;

      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
      pdf.save(`${formData.studentName}_${selectedCertificate?.name}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePNG = async () => {
    if (!formData.studentName.trim()) {
      alert('Please enter student name');
      return;
    }

    setIsGenerating(true);
    try {
      if (!certificateRef.current) return;

      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `${formData.studentName}_${selectedCertificate?.name}.png`;
      link.click();
    } catch (error) {
      console.error('Error generating PNG:', error);
      alert('Error generating image');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Certificate Generator</h1>
        <p className="text-slate-600 mb-8">Create and download beautiful certificates</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">Certificate Details</h2>

              {/* Student Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Student Name</label>
                <input
                  type="text"
                  value={formData.studentName}
                  onChange={(e) => setFormData(prev => ({ ...prev, studentName: e.target.value }))}
                  placeholder="Enter student name"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Certificate Type */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Certificate Type</label>
                <select
                  value={formData.certificateType}
                  onChange={(e) => setFormData(prev => ({ ...prev, certificateType: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CERTIFICATES.map(cert => (
                    <option key={cert.id} value={cert.id}>
                      {cert.name} - {cert.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Issued */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Date Issued</label>
                <input
                  type="date"
                  value={formData.dateIssued}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateIssued: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Certificate ID */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Certificate ID</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.certificateId}
                    readOnly
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
                  />
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, certificateId: generateCertificateId() }))}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold transition-colors"
                  >
                    Regenerate
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-4 border-t border-slate-200">
                <button
                  onClick={() => setPreviewOpen(!previewOpen)}
                  className="w-full px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  {previewOpen ? 'Hide Preview' : 'Show Preview'}
                </button>

                <button
                  onClick={handleGeneratePDF}
                  disabled={isGenerating || !formData.studentName.trim()}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  {isGenerating ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download PDF
                    </>
                  )}
                </button>

                <button
                  onClick={handleGeneratePNG}
                  disabled={isGenerating || !formData.studentName.trim()}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  {isGenerating ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download PNG
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Certificate Preview */}
          <div className="lg:col-span-2">
            {previewOpen && (
              <div className="bg-white rounded-lg shadow-md p-8 overflow-auto max-h-96">
                <CertificatePreview ref={certificateRef} formData={formData} certificate={selectedCertificate} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface CertificatePreviewProps {
  formData: CertificateData;
  certificate: any;
}

const CertificatePreview = React.forwardRef<HTMLDivElement, CertificatePreviewProps>(
  ({ formData, certificate }, ref) => {
    return (
      <div
        ref={ref}
        className="w-full bg-gradient-to-br from-slate-900 to-slate-800 p-12 rounded-lg text-center"
        style={{
          aspectRatio: '16/9',
          backgroundImage: `
            linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%),
            repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 215, 0, 0.03) 10px, rgba(255, 215, 0, 0.03) 20px)
          `,
          border: '3px solid #FFD700',
          boxShadow: 'inset 0 0 20px rgba(255, 215, 0, 0.1), 0 0 30px rgba(255, 215, 0, 0.2)'
        }}
      >
        {/* Decorative Corners */}
        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-yellow-400"></div>
        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-yellow-400"></div>
        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-yellow-400"></div>
        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-yellow-400"></div>

        <div className="relative h-full flex flex-col justify-between">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold text-yellow-400 mb-2">Cognitrium Hub</h1>
            <p className="text-yellow-300 text-sm tracking-widest">CERTIFICATE OF ACHIEVEMENT</p>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <p className="text-white text-sm">This is proudly presented to</p>
            <h2 className="text-3xl font-bold text-yellow-300">{formData.studentName}</h2>
            <p className="text-white text-sm">For successfully earning the</p>
            <p className="text-2xl font-bold text-yellow-400">{certificate?.name}</p>
            <p className="text-white text-sm italic">{certificate?.description}</p>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-end text-xs text-gray-300">
            <div>
              <p className="text-yellow-400 font-semibold">Issued on</p>
              <p>{new Date(formData.dateIssued).toLocaleDateString()}</p>
            </div>
            <div className="text-center">
              <p className="text-yellow-400 font-semibold mb-2">Certificate ID</p>
              <p className="font-mono text-yellow-300">{formData.certificateId}</p>
            </div>
            <div>
              <p className="text-yellow-400 font-semibold">Authorized by</p>
              <p>Cognitrium Admin</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

CertificatePreview.displayName = 'CertificatePreview';
