import { useState } from "react";
import Game from "@/components/Game";
import StartScreen from "@/components/StartScreen";

const Index = () => {
  const [playerName, setPlayerName] = useState<string | null>(null);

  return (
    <div className="w-full h-screen overflow-hidden bg-black relative">
      {playerName ? (
        <Game playerName={playerName} onExit={() => setPlayerName(null)} />
      ) : (
        <StartScreen onStart={(name) => setPlayerName(name)} />
      )}
    </div>
  );
};

export default Index;
