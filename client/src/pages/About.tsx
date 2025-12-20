import { Card } from "@/components/ui/card";
import { Heart, Target, Zap, BookOpen, Users, Trophy } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <img src="/logo.png" alt="HSLC Board Prep" className="w-32 h-32 mx-auto mb-6 rounded-lg" />
          <h1 className="text-5xl font-bold text-gray-800 mb-4">HSLC Preparation Hub</h1>
          <p className="text-xl text-gray-600">
            Your companion for a successful Class 10 board exam journey
          </p>
          <p className="text-lg text-indigo-600 font-semibold mt-4">
            Board Exam: February 10, 2026 | Pre-Board: December 30, 2025
          </p>
        </div>

        {/* Creator Section */}
        <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 shadow-lg p-8 mb-8 border-2 border-indigo-200">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">About the Creator</h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p className="text-lg font-semibold text-indigo-600">
              Hi! I'm Dhirendra Kumar, a Class 10 student.
            </p>
            <p>
              I created this platform especially for all my fellow Class 9 and 10 students out there, particularly those of you studying under the SEBA board! My goal is to offer that extra bit of support we sometimes need beyond school or coaching. Here, you'll find a comprehensive study tracker, detailed solutions, and discussions on important questions and answers that could really help you ace your exams.
            </p>
            <p>
              I understand the pressure of board exams and the need for organized, effective preparation. This platform brings together all the tools you need to track your progress, stay motivated, and succeed in your board exams. Whether you're preparing for your pre-board exams on December 30, 2025, or the main board exam on February 10, 2026, this hub is designed to support your journey.
            </p>
          </div>
        </Card>

        {/* About Section */}
        <Card className="bg-white shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">About This Platform</h2>
          <div className="space-y-6 text-gray-700 leading-relaxed">
            <p>
              Welcome to HSLC Preparation Hub – a comprehensive study platform designed specifically for Class 10 students preparing for their board examinations. This platform is built with the understanding that board exams are a crucial milestone in every student's academic journey, and proper preparation is key to success.
            </p>

            <p>
              As a Class 10 student, you face unique challenges: managing multiple subjects, keeping track of your progress, staying motivated, and finding effective study strategies. This platform addresses all these challenges by providing a centralized hub where you can track your study progress, organize your preparation, and access personalized guidance.
            </p>

            <p>
              Whether you're just starting your preparation or in the final stages of revision, this platform adapts to your needs. From logging your daily study hours to tracking topic completion across six subjects, from following a structured Advanced Mathematics study plan to accessing AI-powered study tips and practice questions – everything is designed to support your success.
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
                  Track all six subjects systematically. Break down each subject into chapters and topics, mark your progress, and never lose sight of what you've covered and what's left.
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
                  Log your daily study hours, track your study sessions, and visualize your progress through charts. Consistency is the key to success, and this platform helps you maintain it.
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
                <h3 className="text-lg font-bold text-gray-800">Follow a Structured Plan</h3>
                <p className="text-gray-700 mt-2">
                  The Advanced Mathematics study plan provides a day-by-day schedule for intensive revision. Follow it or customize it based on your needs – the choice is yours.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-600 text-white">
                  <Zap className="h-6 w-6" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Get Personalized Guidance</h3>
                <p className="text-gray-700 mt-2">
                  Our AI-powered study assistant generates personalized tips, practice questions, and answers your subject-specific questions. Get expert guidance whenever you need it.
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
                <h3 className="text-lg font-bold text-gray-800">Stay Motivated</h3>
                <p className="text-gray-700 mt-2">
                  The countdown timer keeps you aware of the time remaining until the exam. Motivational messages and your progress visualization help you stay focused and inspired.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Why This Matters */}
        <Card className="bg-white shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Why Board Exams Matter</h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              Class 10 board exams are not just another test – they are a significant milestone that shapes your academic future. These exams test not just your knowledge but also your ability to manage stress, organize information, and perform under pressure.
            </p>

            <p>
              Success in board exams opens doors to better colleges, streams of your choice, and career opportunities. More importantly, it builds confidence and develops study habits that will serve you throughout your academic journey.
            </p>

            <p>
              This platform is designed to help you navigate this crucial phase with confidence. By providing tools for organization, tracking, and personalized guidance, we aim to make your preparation more effective and less stressful.
            </p>
          </div>
        </Card>

        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg p-6 border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-800">Multi-Subject Tracking</h3>
            </div>
            <p className="text-gray-700">
              Track all 6 subjects with individual progress indicators, topic completion, and notes for each chapter.
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg p-6 border-2 border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-bold text-gray-800">Daily Progress Tracking</h3>
            </div>
            <p className="text-gray-700">
              Log your study hours daily, track sample papers, and visualize your progress through interactive charts.
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg p-6 border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-bold text-gray-800">Structured Study Plans</h3>
            </div>
            <p className="text-gray-700">
              Follow pre-designed study schedules or create your own. The Advanced Mathematics plan covers all chapters systematically.
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-red-50 shadow-lg p-6 border-2 border-orange-200">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-orange-600" />
              <h3 className="text-lg font-bold text-gray-800">AI Study Assistant</h3>
            </div>
            <p className="text-gray-700">
              Get personalized tips, practice questions, Q&A support, and recommendations based on your study patterns.
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
              Your board exam is not a measure of your intelligence – it's a measure of your preparation and dedication. With the right tools, the right mindset, and consistent effort, you can achieve excellent results.
            </p>

            <p className="font-bold text-xl">
              This platform is here to support you every step of the way. Let's make your Class 10 board exam a success story! 🚀
            </p>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600">
          <p>
            Built with ❤️ for Class 10 students preparing for board exams
          </p>
          <p className="mt-2 text-sm">
            © 2025 HSLC Preparation Hub. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
