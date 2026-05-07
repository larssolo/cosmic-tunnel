import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { CloudHighScoreService } from "@/services/CloudHighScoreService";
import loginBackground from "@/assets/login-background.mp4";
import StarWarsCrawl from "./StarWarsCrawl";
import { unlockAudio, soundManager } from "@/hooks/useSound";

interface StartScreenProps {
  onStart: (playerName: string) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const [showCrawl, setShowCrawl] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [error, setError] = useState("");
  const [blink, setBlink] = useState(true);

  const { data: highScores = [] } = useQuery({
    queryKey: ["highScores"],
    queryFn: () => CloudHighScoreService.getHighScores(10),
  });

  // Stop game sounds and start menu music when start screen mounts
  useEffect(() => {
    soundManager.stop('atmosphere');
    return () => {
      soundManager.stop('menuMusic');
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setBlink((b) => !b), 600);
    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    const name = playerName.trim().toUpperCase().slice(0, 12);
    if (name.length < 2) {
      setError("ENTER A NAME (MIN 2 CHARS)");
      return;
    }
    // Stop menu music, unlock audio context, play start sound — all in the click handler
    soundManager.stop('menuMusic');
    soundManager.play('start');
    localStorage.setItem("playerName", name);
    onStart(name);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleStart();
  };

  // Unlock audio + start menu music on first interaction anywhere on the page
  const handleFirstInteraction = () => {
    unlockAudio();
    soundManager.play('menuMusic');
  };

  return (
    <div onPointerDown={handleFirstInteraction} onKeyDown={handleFirstInteraction}
      className="absolute inset-0 flex items-center justify-center p-4 overflow-hidden"
      style={{ fontFamily: "'Press Start 2P', monospace" }}
    >
      {showCrawl && <StarWarsCrawl onDone={() => setShowCrawl(false)} />}
      <video
        className="absolute inset-0 w-full h-full object-cover opacity-40"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={loginBackground} type="video/mp4" />
      </video>

      {/* CRT scanlines */}
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0px, rgba(0,0,0,0.25) 1px, transparent 1px, transparent 3px)",
        }}
      />
      <div className="absolute inset-0 bg-black/60 z-10" />

      <div
        className="relative z-30 w-full max-w-2xl text-center"
        style={{
          opacity: showCrawl ? 0.15 : 1,
          transition: "opacity 0.5s ease",
        }}
      >
        {/* Title */}
        <h1
          className="text-3xl md:text-5xl mb-2 leading-tight"
          style={{
            color: "#ff00ff",
            textShadow:
              "3px 3px 0 #00ffff, 6px 6px 0 #000, 0 0 20px #ff00ff",
            letterSpacing: "0.05em",
          }}
        >
          COSMIC
        </h1>
        <h1
          className="text-3xl md:text-5xl mb-6 leading-tight"
          style={{
            color: "#00ffff",
            textShadow:
              "3px 3px 0 #ff00ff, 6px 6px 0 #000, 0 0 20px #00ffff",
            letterSpacing: "0.05em",
          }}
        >
          TUNNEL
        </h1>

        <p
          className="text-xs md:text-sm mb-6"
          style={{ color: "#ffff00", textShadow: "2px 2px 0 #000" }}
        >
          ★ INSERT COIN ★ 1 PLAYER ★
        </p>

        {/* High scores */}
        <div
          className="mb-6 p-4 border-4 mx-auto max-w-md"
          style={{
            borderColor: "#00ff00",
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            boxShadow: "0 0 20px #00ff00, inset 0 0 20px rgba(0,255,0,0.2)",
          }}
        >
          <p
            className="text-xs md:text-sm mb-3"
            style={{ color: "#00ff00", textShadow: "0 0 8px #00ff00" }}
          >
            ► HIGH SCORES ◄
          </p>
          {highScores.length > 0 ? (
            <div
              className="overflow-hidden relative"
              style={{ height: "140px", maskImage: "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)" }}
            >
              <ol
                className="text-[10px] md:text-xs space-y-1.5 absolute left-0 right-0"
                style={{ animation: `leaderboardScroll ${Math.max(highScores.length * 1.6, 12)}s linear infinite` }}
              >
                {/* Render the list twice so the loop is seamless */}
                {[...highScores.slice(0, 10), ...highScores.slice(0, 10)].map((entry, idx) => {
                  const realIdx = idx % highScores.slice(0, 10).length;
                  const colors = ["#ffff00", "#ffffff", "#ff8800"];
                  const color = colors[realIdx] || "#00ffaa";
                  return (
                    <li
                      key={`${entry.id}-${idx}`}
                      className="flex justify-between gap-2"
                      style={{ color, textShadow: `0 0 4px ${color}` }}
                    >
                      <span>
                        {String(realIdx + 1).padStart(2, "0")}.{" "}
                        {entry.player_name.toUpperCase().slice(0, 12).padEnd(12, ".")}
                      </span>
                      <span>{String(entry.score).padStart(6, "0")}</span>
                    </li>
                  );
                })}
              </ol>
              <style>{`
                @keyframes leaderboardScroll {
                  0% { transform: translateY(0); }
                  100% { transform: translateY(-50%); }
                }
              `}</style>
            </div>
          ) : (
            <p
              className="text-[10px] md:text-xs"
              style={{ color: "#888" }}
            >
              NO SCORES YET — BE THE FIRST!
            </p>
          )}
        </div>

        {/* Name input */}
        <div className="mb-4">
          <label
            className="block text-[10px] md:text-xs mb-2"
            style={{ color: "#ff00ff", textShadow: "0 0 6px #ff00ff" }}
          >
            ENTER PILOT NAME:
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => {
              setPlayerName(e.target.value.toUpperCase().slice(0, 12));
              setError("");
            }}
            onKeyDown={handleKeyDown}
            maxLength={12}
            placeholder="NAME"
            className="w-48 md:w-64 text-center text-base md:text-xl py-2 px-3 outline-none"
            style={{
              fontFamily: "'Press Start 2P', monospace",
              backgroundColor: "#000",
              color: "#00ffff",
              border: "3px solid #00ffff",
              boxShadow: "0 0 15px #00ffff",
              textShadow: "0 0 8px #00ffff",
              letterSpacing: "0.2em",
            }}
            autoFocus
          />
          {error && (
            <p
              className="text-[10px] mt-2"
              style={{ color: "#ff0000", textShadow: "0 0 6px #ff0000" }}
            >
              ! {error} !
            </p>
          )}
        </div>

        {/* Start button */}
        <button
          onClick={handleStart}
          className="px-6 py-4 text-sm md:text-base transition-transform hover:scale-105 active:scale-95"
          style={{
            fontFamily: "'Press Start 2P', monospace",
            backgroundColor: "#ff00ff",
            color: "#fff",
            border: "4px solid #ffff00",
            textShadow: "2px 2px 0 #000",
            boxShadow: "0 0 25px #ff00ff, 4px 4px 0 #000",
            opacity: blink ? 1 : 0.6,
          }}
        >
          ▶ PRESS START ◀
        </button>

        <div className="mt-4">
          <button
            onClick={() => setShowCrawl(true)}
            className="px-4 py-2 text-[10px] md:text-xs transition-transform hover:scale-105 active:scale-95"
            style={{
              fontFamily: "'Press Start 2P', monospace",
              backgroundColor: "transparent",
              color: "#00ffff",
              border: "2px solid #00ffff",
              textShadow: "0 0 6px #00ffff",
              boxShadow: "0 0 10px #00ffff66",
            }}
          >
            ▸ PILOT INSTRUCTIONS ◂
          </button>
        </div>

        <p
          className="mt-6 text-[9px] md:text-[10px]"
          style={{ color: "#888" }}
        >
          © 2026{" "}
          <a
            href="http://www.larssohl.dk"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#00ffff", textDecoration: "underline", textShadow: "0 0 6px #00ffff" }}
          >
            LARS.SOHL
          </a>{" "}
          ARCADE &nbsp;·&nbsp; <span style={{ color: "#555" }}>v{__APP_VERSION__}</span>
        </p>
      </div>
    </div>
  );
};

export default StartScreen;
