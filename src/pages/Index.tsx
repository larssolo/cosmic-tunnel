import { useState } from "react";
import Game from "@/components/Game";
import StartScreen from "@/components/StartScreen";

const Index = () => {
  const [gameStarted, setGameStarted] = useState(false);

  return (
    <div className="w-full h-screen overflow-hidden bg-black relative">
      {gameStarted ? (
        <Game />
      ) : (
        <StartScreen onStart={() => setGameStarted(true)} />
      )}
    </div>
  );
};

export default Index;
