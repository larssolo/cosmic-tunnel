
import React, { useEffect, useState } from "react";
import { HighScore } from "@/types/gameTypes";
import { HighScoreService } from "@/services/HighScoreService";
import { Trophy } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const HighScoreList: React.FC = () => {
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHighScores = async () => {
    setLoading(true);
    try {
      const scores = await HighScoreService.getTopScores();
      setHighScores(scores);
    } catch (error) {
      console.error('Failed to fetch high scores:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHighScores();
    
    // Refresh scores every 30 seconds
    const intervalId = setInterval(fetchHighScores, 30000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <Card className="w-full max-w-md bg-black/50 text-white backdrop-blur-sm border-purple-500/20"
          style={{
            boxShadow: "0 0 15px rgba(155, 135, 245, 0.3)",
          }}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Trophy size={20} className="text-yellow-400" />
          <span>Best Pilots</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-4 text-center text-muted-foreground">Loading scores...</div>
        ) : highScores.length === 0 ? (
          <div className="py-4 text-center text-muted-foreground">No scores yet. Be the first!</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-white">Rank</TableHead>
                <TableHead className="text-white">Pilot</TableHead>
                <TableHead className="text-white text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {highScores.map((score, index) => (
                <TableRow key={index} className="border-b border-purple-500/20">
                  <TableCell className="font-medium">
                    {index === 0 ? (
                      <span className="text-yellow-400 font-bold">1</span>
                    ) : index === 1 ? (
                      <span className="text-gray-300 font-bold">2</span>
                    ) : index === 2 ? (
                      <span className="text-amber-600 font-bold">3</span>
                    ) : (
                      index + 1
                    )}
                  </TableCell>
                  <TableCell>{score.playerName}</TableCell>
                  <TableCell className="text-right">{score.score}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default HighScoreList;
