import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import SubjectsTracker from "./pages/SubjectsTracker";
import JEEPlan from "./pages/JEEPlan";
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
import Certificates from "./pages/Certificates";
import ContactCollection from "./pages/ContactCollection";
import Login from "./pages/Login";
import StudyMaterials from "./pages/StudyMaterials";
import Home from "./pages/Home";
import CommunityToppers from "./pages/CommunityToppers";
import Analytics from "./pages/Analytics";
import ConceptVault from "./pages/ConceptVault";
import ChatCoach from "./pages/ChatCoach";
import DPPGenerator from "./pages/DPPGenerator";
import ImageGenerator from "./pages/ImageGenerator";
import AdminUploadedMaterials from "./pages/AdminUploadedMaterials";
import AdminMessaging from "./pages/AdminMessaging";

function DashboardRouter() {
  return (
    <Switch>
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/subjects"} component={SubjectsTracker} />
      <Route path={"/jee-plan"} component={JEEPlan} />
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
      <Route path={"/certificates"} component={Certificates} />
      <Route path={"/study-materials"} component={StudyMaterials} />
      <Route path={"/community-toppers"} component={CommunityToppers} />
      <Route path={"/analytics"} component={Analytics} />
      <Route path={"/concept-vault"} component={ConceptVault} />
      <Route path={"/chat-coach"} component={ChatCoach} />
      <Route path={"/dpp-generator"} component={DPPGenerator} />
      <Route path={"/image-generator"} component={ImageGenerator} />
      <Route path={"/admin-materials"} component={AdminUploadedMaterials} />
      <Route path={"/admin-messaging"} component={AdminMessaging} />
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
          <Switch>
            {/* Login page - outside DashboardLayout */}
            <Route path={"/login"} component={Login} />
            {/* Contact page - outside DashboardLayout to avoid auth loop */}
            <Route path={"/contact"} component={ContactCollection} />
            {/* Home page - handles both authenticated and unauthenticated users */}
            <Route path={"/"} component={Home} />
            {/* All other pages inside DashboardLayout */}
            <Route>
              <DashboardLayout>
                <DashboardRouter />
              </DashboardLayout>
            </Route>
          </Switch>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
