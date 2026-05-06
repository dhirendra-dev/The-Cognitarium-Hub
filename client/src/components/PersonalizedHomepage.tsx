import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Filter } from "lucide-react";

interface PersonalizedHomepageProps {
  userStream?: string;
  userBoard?: string;
}

export function PersonalizedHomepage({ userStream = "science", userBoard = "CBSE" }: PersonalizedHomepageProps) {
  const [selectedBoard, setSelectedBoard] = useState(userBoard);
  const [filteredMaterials, setFilteredMaterials] = useState<any[]>([]);

  const boards = ["CBSE", "HSLC", "MP_BOARD"];
  const streams = ["science", "commerce", "arts"];

  // Simulate filtering materials based on board
  useEffect(() => {
    // In a real app, this would fetch filtered materials from the API
    const materials = [
      { id: 1, title: "Physics Notes", board: "CBSE", stream: "science" },
      { id: 2, title: "Chemistry Solutions", board: "CBSE", stream: "science" },
      { id: 3, title: "Biology Revision", board: "HSLC", stream: "science" },
      { id: 4, title: "Math Practice", board: "MP_BOARD", stream: "science" },
    ];

    const filtered = materials.filter(
      (m) => m.board === selectedBoard && m.stream === userStream
    );
    setFilteredMaterials(filtered);
  }, [selectedBoard, userStream]);

  return (
    <div className="space-y-6">
      {/* Board Filter Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Personalized Content
              </CardTitle>
              <CardDescription>
                View materials tailored to your board and stream
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Board Selection */}
            <div>
              <label className="text-sm font-medium mb-3 block">Select Your Board</label>
              <div className="flex flex-wrap gap-2">
                {boards.map((board) => (
                  <Button
                    key={board}
                    variant={selectedBoard === board ? "default" : "outline"}
                    onClick={() => setSelectedBoard(board)}
                    className="flex-1 sm:flex-none"
                  >
                    {board === "MP_BOARD" ? "MP Board" : board}
                  </Button>
                ))}
              </div>
            </div>

            {/* Filtered Materials */}
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3">Materials for {selectedBoard}</h3>
              {filteredMaterials.length > 0 ? (
                <div className="grid gap-3">
                  {filteredMaterials.map((material) => (
                    <div
                      key={material.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <BookOpen className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-sm">{material.title}</p>
                            <p className="text-xs text-gray-500">
                              {material.board} • {material.stream}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No materials available for {selectedBoard} yet
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
