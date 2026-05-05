import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export default function CommunityToppers() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null);

  const { data: toppers = [], isLoading } = trpc.toppers.getToppers.useQuery();

  // Filter toppers by selected board
  const filteredToppers = useMemo(() => {
    if (!selectedBoard) return toppers;
    return toppers.filter((topper: any) => topper.board === selectedBoard);
  }, [toppers, selectedBoard]);

  // Get unique boards
  const boards = useMemo(() => {
    const uniqueBoards = new Set(toppers.map((t: any) => t.board));
    return Array.from(uniqueBoards).sort();
  }, [toppers]);

  // Paginate toppers
  const totalPages = Math.ceil(filteredToppers.length / ITEMS_PER_PAGE);
  const paginatedToppers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredToppers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredToppers, currentPage]);

  // Reset to first page when board changes
  const handleBoardChange = (board: string | null) => {
    setSelectedBoard(board);
    setCurrentPage(1);
  };

  const getBoardColor = (board: string) => {
    switch (board) {
      case 'CBSE':
        return 'bg-blue-100 text-blue-800';
      case 'MP Board':
        return 'bg-purple-100 text-purple-800';
      case 'HSLC Assam':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Community Toppers</h1>
        <p className="text-gray-600">Top performers from Cognitarium Hub Merit List 2026</p>
      </div>

      {/* Board Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedBoard === null ? 'default' : 'outline'}
          onClick={() => handleBoardChange(null)}
          size="sm"
        >
          All Boards ({filteredToppers.length})
        </Button>
        {boards.map((board) => {
          const count = toppers.filter((t: any) => t.board === board).length;
          return (
            <Button
              key={board}
              variant={selectedBoard === board ? 'default' : 'outline'}
              onClick={() => handleBoardChange(board)}
              size="sm"
            >
              {board} ({count})
            </Button>
          );
        })}
      </div>

      {/* Toppers List */}
      <div className="space-y-3">
        {paginatedToppers.length > 0 ? (
          paginatedToppers.map((topper: any, index: number) => (
            <Card key={topper.rank} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {/* Rank */}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">#{topper.rank}</div>
                  </div>

                  {/* Topper Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{topper.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getBoardColor(topper.board)}>{topper.board}</Badge>
                      <span className="text-sm text-gray-600">{topper.marks}</span>
                    </div>
                  </div>
                </div>

                {/* Percentage */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{topper.percentage}</div>
                  <span className="text-xs text-gray-500">Score</span>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No toppers found for the selected board.</p>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages} • Showing {paginatedToppers.length} of {filteredToppers.length}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
