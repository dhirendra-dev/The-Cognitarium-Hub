import { Card } from "@/components/ui/card";
import { Heart, Target, Zap, BookOpen, Users, Trophy } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">JEE & Board Exam Prep Hub</h1>
          <p className="text-xl text-gray-600">
            Your comprehensive companion for Class 11-12 and JEE Main/Advanced success
          </p>
        </div>

        {/* About Section */}
        <Card className="bg-white shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">About This Platform</h2>
          <div className="space-y-6 text-gray-700 leading-relaxed">
            <p>
              Welcome to JEE & Board Exam Prep Hub – a comprehensive study platform designed for Class 11-12 students preparing for board exams and JEE Main/Advanced. This platform understands that you're juggling multiple goals: excelling in board exams while preparing for competitive exams like JEE.
            </p>

            <p>
              As a Class 11-12 student, you face unique challenges: managing Physics, Chemistry, and Mathematics simultaneously, balancing board exam preparation with JEE prep, tracking your progress across multiple exams, staying motivated through the grind, and finding effective study strategies. This platform addresses all these challenges by providing a centralized hub for your entire preparation journey.
            </p>

            <p>
              Whether you're in Class 11, Class 12, or preparing for JEE, this platform adapts to your needs. From logging your daily study hours to tracking topic completion across all subjects, from accessing structured study materials to connecting with a community of thousands of students – everything is designed to support your success.
            </p>
          </div>
        </Card>

        {/* Student Journey */}
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 shadow-lg p-8 mb-8 border-2 border-indigo-200">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Your Journey to Success</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600 text-white">
                  <BookOpen className="h-6 w-6" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Organize Your Studies</h3>
                <p className="text-gray-700 mt-2">
                  Track Physics, Chemistry, and Mathematics systematically. Break down each subject into chapters and topics, mark your progress, and never lose sight of what you've covered.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-600 text-white">
                  <Zap className="h-6 w-6" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Stay Consistent</h3>
                <p className="text-gray-700 mt-2">
                  Log your daily study hours, track your study sessions, and visualize your progress through charts. Consistency is the key to cracking JEE and board exams.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-yellow-600 text-white">
                  <Target className="h-6 w-6" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Access Study Materials</h3>
                <p className="text-gray-700 mt-2">
                  Download comprehensive notes, previous year questions, practice papers, and study guides. All materials are curated for both board exams and JEE preparation.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-600 text-white">
                  <Users className="h-6 w-6" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Join the Community</h3>
                <p className="text-gray-700 mt-2">
                  Connect with thousands of students through official WhatsApp groups, Telegram channels, and Google Classroom. Get doubt clarification, share resources, and stay motivated together.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-pink-600 text-white">
                  <Heart className="h-6 w-6" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Get AI-Powered Guidance</h3>
                <p className="text-gray-700 mt-2">
                  Our AI assistant generates personalized tips, practice questions, and answers your subject-specific questions. Get expert guidance whenever you need it.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Why This Matters */}
        <Card className="bg-white shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Why This Preparation Matters</h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              Class 11-12 board exams and JEE are not just tests – they are crucial milestones that shape your academic and professional future. These exams test not just your knowledge but also your ability to manage stress, organize information, and perform under pressure.
            </p>

            <p>
              Success in board exams and JEE opens doors to top colleges, desired branches, and career opportunities. More importantly, it builds confidence and develops study habits that will serve you throughout your life.
            </p>

            <p>
              This platform is designed to help you navigate this critical phase with confidence. By providing tools for organization, tracking, community support, and personalized guidance, we aim to make your preparation more effective, collaborative, and less stressful.
            </p>
          </div>
        </Card>

        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg p-6 border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-800">Multi-Subject Tracking</h3>
            </div>
            <p className="text-gray-700">
              Track Physics, Chemistry, and Mathematics with individual progress indicators, topic completion, and notes for each chapter.
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg p-6 border-2 border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-bold text-gray-800">Daily Progress Tracking</h3>
            </div>
            <p className="text-gray-700">
              Log your study hours daily, track practice papers, and visualize your progress through interactive charts and statistics.
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg p-6 border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-bold text-gray-800">Study Materials & Resources</h3>
            </div>
            <p className="text-gray-700">
              Access comprehensive notes, PYQs, practice papers, and study guides curated for both board exams and JEE preparation.
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-red-50 shadow-lg p-6 border-2 border-orange-200">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-orange-600" />
              <h3 className="text-lg font-bold text-gray-800">Community Support</h3>
            </div>
            <p className="text-gray-700">
              Connect with thousands of students through official WhatsApp groups, Telegram channels, and Google Classroom for doubt clarification and motivation.
            </p>
          </Card>
        </div>

        {/* Motivational Message */}
        <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">Remember</h2>
          <div className="space-y-4 text-lg leading-relaxed">
            <p>
              "Success is not about being perfect. It's about consistent effort, smart preparation, and believing in yourself. Every hour you study, every topic you complete, every question you solve brings you closer to your goal."
            </p>

            <p>
              Your board exam and JEE are not measures of your intelligence – they are measures of your preparation and dedication. With the right tools, the right mindset, and consistent effort, you can achieve excellent results.
            </p>

            <p className="font-bold text-xl">
              Stay disciplined. Stay focused. Stay consistent. 💪
            </p>

            <p className="font-bold text-xl">
              This platform is here to support you every step of the way. Let's make your Class 11-12 and JEE journey a success story! 🚀
            </p>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600">
          <p>
            Built with ❤️ for Class 11-12 students preparing for board exams and JEE
          </p>
          <p className="mt-2 text-sm">
            © 2025 JEE & Board Exam Prep Hub. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
