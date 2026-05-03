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
        <p className="text-gray-300 mb-6">Pilot dit rumskib gennem den kosmiske tunnel</p>

        <div className="text-left space-y-3 mb-8 bg-black/40 rounded-lg p-4 border border-purple-500/20">
          <p className="text-sm font-semibold text-purple-300 uppercase tracking-wider mb-2">
            Sådan spiller du
          </p>

          <div className="flex items-start gap-3">
            <MousePointer2 size={20} className="text-purple-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm">
              <span className="hidden md:inline">Bevæg musen til venstre/højre for at styre rumskibet</span>
              <span className="md:hidden">Tryk og træk for at styre rumskibet</span>
            </p>
          </div>

          <div className="flex items-start gap-3">
            <Smartphone size={20} className="text-purple-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm md:hidden">Vip telefonen til siderne for præcis styring</p>
            <p className="text-sm hidden md:block">På mobil: vip telefonen til siderne</p>
          </div>

          <div className="flex items-start gap-3">
            <Zap size={20} className="text-yellow-300 mt-0.5 flex-shrink-0" />
            <p className="text-sm">Klik eller tryk for at skyde mod meteorer</p>
          </div>

          <div className="flex items-start gap-3">
            <Rocket size={20} className="text-pink-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm">Saml power-ups, undgå sammenstød, og kæmp dig op gennem niveauerne</p>
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
