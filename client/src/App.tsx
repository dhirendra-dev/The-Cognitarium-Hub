import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import SubjectsTracker from "./pages/SubjectsTracker";
import MathStudyPlan from "./pages/MathStudyPlan";
import DailyTasks from "./pages/DailyTasks";
import AIAssistant from "./pages/AIAssistant";
import About from "./pages/About";
import Settings from "./pages/Settings";
import Leaderboard from "./pages/Leaderboard";
import SyllabusTracker from "./pages/SyllabusTracker";
import AdminDashboard from "./pages/AdminDashboard";
import Posts from "./pages/Posts";
import BoardExamQuestions from "./pages/BoardExamQuestions";
import PDFUpload from "./pages/PDFUpload";
import PDFBrowser from "./pages/PDFBrowser";
import StudyLinks from "./pages/StudyLinks";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Dashboard} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/subjects"} component={SubjectsTracker} />
      <Route path={"/math-plan"} component={MathStudyPlan} />
      <Route path={"/daily-tasks"} component={DailyTasks} />
      <Route path={"/ai-assistant"} component={AIAssistant} />
      <Route path={"/leaderboard"} component={Leaderboard} />
      <Route path={"/syllabus"} component={SyllabusTracker} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/about"} component={About} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/posts"} component={Posts} />
      <Route path={"/board-exam-questions"} component={BoardExamQuestions} />
      <Route path={"/pdf-upload"} component={PDFUpload} />
      <Route path={"/pdf-browser"} component={PDFBrowser} />
      <Route path={"/study-links"} component={StudyLinks} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <DashboardLayout>
            <Router />
          </DashboardLayout>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
