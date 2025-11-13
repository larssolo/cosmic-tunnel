import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Game from "@/components/Game";
import { Button } from "@/components/ui/button";
import { Download, LogOut } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleDownload = () => {
    toast.info("For at downloade projektet:", {
      description: "1. Forbind din GitHub konto i Lovable\n2. Tryk på GitHub knappen øverst til højre\n3. Download projektet derfra",
      duration: 8000,
    });
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Du er nu logget ud");
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <div className="text-primary text-xl">Loader...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="w-full h-screen overflow-hidden bg-black relative">
      {/* Top bar with download and logout buttons */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <Button
          onClick={handleDownload}
          variant="outline"
          size="sm"
          className="bg-black/50 backdrop-blur-sm border-primary/20 hover:bg-primary/10 text-primary"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Projekt
        </Button>
        <Button
          onClick={handleSignOut}
          variant="outline"
          size="sm"
          className="bg-black/50 backdrop-blur-sm border-primary/20 hover:bg-destructive/10 text-destructive"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Log ud
        </Button>
      </div>
      
      <Game />
    </div>
  );
};

export default Index;
