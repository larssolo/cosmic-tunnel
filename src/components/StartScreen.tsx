import React from "react";
import { Button } from "@/components/ui/button";
import { Rocket, Zap, MousePointer2, Smartphone } from "lucide-react";
import loginBackground from "@/assets/login-background.mp4";

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 overflow-hidden">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={loginBackground} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/50" />

      <div
        className="relative z-10 max-w-lg w-full bg-black/60 backdrop-blur-md border border-purple-500/30 rounded-xl p-8 text-white text-center"
        style={{ boxShadow: "0 0 30px rgba(155, 135, 245, 0.4)" }}
      >
        <h1
          className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent"
          style={{ textShadow: "0 0 20px rgba(155, 135, 245, 0.6)" }}
        >
          Cosmic Tunnel
        </h1>
        <p className="text-gray-300 mb-6">Pilot your spaceship through the cosmic tunnel</p>

        <div className="text-left space-y-3 mb-8 bg-black/40 rounded-lg p-4 border border-purple-500/20">
          <p className="text-sm font-semibold text-purple-300 uppercase tracking-wider mb-2">
            How to play
          </p>

          <div className="flex items-start gap-3">
            <MousePointer2 size={20} className="text-purple-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm">
              <span className="hidden md:inline">Move your mouse left/right to control the spaceship</span>
              <span className="md:hidden">Tap and drag to control the spaceship</span>
            </p>
          </div>

          <div className="flex items-start gap-3">
            <Smartphone size={20} className="text-purple-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm md:hidden">Tilt your phone left/right for precise control</p>
            <p className="text-sm hidden md:block">On mobile: tilt your phone left/right</p>
          </div>

          <div className="flex items-start gap-3">
            <Zap size={20} className="text-yellow-300 mt-0.5 flex-shrink-0" />
            <p className="text-sm">Click or tap to shoot at meteors</p>
          </div>

          <div className="flex items-start gap-3">
            <Rocket size={20} className="text-pink-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm">Collect power-ups, avoid collisions, and fight your way through the levels</p>
          </div>
        </div>

        <Button
          onClick={onStart}
          size="lg"
          className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-lg py-6"
        >
          <Rocket className="mr-2" />
          Start Mission
        </Button>
      </div>
    </div>
  );
};

export default StartScreen;
