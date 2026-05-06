import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, Play } from "lucide-react";

interface IncompleteSession {
  id: number;
  materialTitle: string;
  materialType: string;
  progressPercentage: number;
  lastAccessedAt: string;
}

interface ContinueLearningProps {
  sessions?: IncompleteSession[];
  isLoading?: boolean;
}

export function ContinueLearning({ sessions = [], isLoading = false }: ContinueLearningProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Continue Learning
          </CardTitle>
          <CardDescription>Resume your incomplete study sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border rounded-lg animate-pulse bg-gray-50" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Continue Learning
        </CardTitle>
        <CardDescription>Resume your incomplete study sessions</CardDescription>
      </CardHeader>
      <CardContent>
        {sessions.length > 0 ? (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1">{session.materialTitle}</h4>
                    <p className="text-xs text-gray-500">
                      {session.materialType} • Last accessed{" "}
                      {new Date(session.lastAccessedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">
                    {session.progressPercentage}%
                  </span>
                </div>
                <Progress value={session.progressPercentage} className="mb-3" />
                <Button
                  variant="default"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Continue
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              No incomplete sessions yet. Start learning to see your progress here!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
