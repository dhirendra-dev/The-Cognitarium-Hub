import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BookOpen, Users, Award, Zap } from "lucide-react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    // Redirect authenticated users to dashboard
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">📚 HSLC Prep Hub</div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate("/contact")}>
              Join Now
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Master Your Board Exams
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Comprehensive preparation platform for HSLC students with study materials, practice tests, and community support
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            onClick={() => navigate("/contact")}
          >
            Get Started <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="border-2 border-blue-200 hover:shadow-lg transition">
            <CardHeader>
              <BookOpen className="w-8 h-8 text-blue-600 mb-2" />
              <CardTitle className="text-lg">Study Materials</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Access comprehensive study materials and notes for all subjects</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-indigo-200 hover:shadow-lg transition">
            <CardHeader>
              <Zap className="w-8 h-8 text-indigo-600 mb-2" />
              <CardTitle className="text-lg">Practice Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Take unlimited practice tests and track your progress</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 hover:shadow-lg transition">
            <CardHeader>
              <Users className="w-8 h-8 text-purple-600 mb-2" />
              <CardTitle className="text-lg">Community</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Connect with peers, ask questions, and share knowledge</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-pink-200 hover:shadow-lg transition">
            <CardHeader>
              <Award className="w-8 h-8 text-pink-600 mb-2" />
              <CardTitle className="text-lg">Certificates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Earn certificates for your achievements and contributions</p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center border-2 border-blue-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Excel in Your Board Exams?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of students already preparing with HSLC Prep Hub
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            onClick={() => navigate("/contact")}
          >
            Join Our Community <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">© 2026 HSLC Prep Hub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
