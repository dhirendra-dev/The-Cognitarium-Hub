import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, MessageCircle, Users, BookOpen, FileText, Zap, Send } from "lucide-react";

const studyLinks = [
  {
    title: "Doubt Discussion (Study-related only)",
    description: "Ask and solve study-related doubts with the community",
    icon: MessageCircle,
    url: "https://chat.whatsapp.com/KJqJwzLDanR6j70enyaKCt?mode=gi_t",
    color: "bg-green-100 text-green-700",
  },
  {
    title: "Community (Official Discussion Space)",
    description: "Join the official community for general discussions",
    icon: Users,
    url: "https://chat.whatsapp.com/D7Hgc3sSj8663X34MZRP2l",
    color: "bg-blue-100 text-blue-700",
  },
  {
    title: "Project 45 – Notes & Study Plan",
    description: "Access comprehensive notes and structured study plans",
    icon: BookOpen,
    url: "https://chat.whatsapp.com/IweVtAExMNL0nwetN3PJUJ?mode=gi_t",
    color: "bg-purple-100 text-purple-700",
  },
  {
    title: "Notes Archive (PDFs & Materials)",
    description: "Download all PDFs and study materials in one place",
    icon: FileText,
    url: "https://chat.whatsapp.com/I7M4ST9zGPkKE5hqLRC0y7?mode=gi_t",
    color: "bg-orange-100 text-orange-700",
  },
  {
    title: "PYQ & Practice Questions",
    description: "Previous year questions and practice problems",
    icon: Zap,
    url: "https://chat.whatsapp.com/BeNHv56uxcc6DpLNSTcFJd?mode=gi_t",
    color: "bg-red-100 text-red-700",
  },
  {
    title: "16-Day Board Exam Challenge",
    description: "Join the intensive 16-day exam preparation challenge",
    icon: Zap,
    url: "https://chat.whatsapp.com/JPbqE9cgfWS2s77eBK1y0z?mode=gi_t",
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    title: "Telegram – The Cognitarium Hub Community",
    description: "Official Telegram channel for exam updates and resources",
    icon: Send,
    url: "https://t.me/+C0UKYQKjgFc3MGE1",
    color: "bg-cyan-100 text-cyan-700",
  },
  {
    title: "Google Classroom (Official)",
    description: "Official classroom for assignments and announcements",
    icon: BookOpen,
    url: "https://classroom.google.com/c/Nzg5NjA0NjYwOTU1?cjc=27c3lad3",
    color: "bg-indigo-100 text-indigo-700",
  },
  {
    title: "Free Google Drive Notes",
    description: "Access all free notes and study materials on Google Drive",
    icon: FileText,
    url: "https://drive.google.com/drive/folders/1oYl3rzIDFGKcDal0bD_q6I4AiLBQBsQl",
    color: "bg-gray-100 text-gray-700",
  },
];

export default function StudyLinks() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📢 Official Study Links
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Connect with the community, access resources, and stay updated with all official channels
          </p>
          <div className="inline-block bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold">
            Stay disciplined. Stay focused. Stay consistent.
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {studyLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow overflow-hidden">
                <div className={`h-2 ${link.color.split(" ")[0]}`}></div>
                <div className="p-6">
                  <div className={`inline-flex p-3 rounded-lg mb-4 ${link.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {link.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {link.description}
                  </p>
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full" variant="outline">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Join Now
                    </Button>
                  </a>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Footer Message */}
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Excel in Your Exams?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join our community of thousands of students preparing for JEE and Board exams. 
            Access premium study materials, connect with peers, and get expert guidance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Explore Study Materials
            </Button>
            <Button size="lg" variant="outline">
              View Leaderboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
