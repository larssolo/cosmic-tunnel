import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Game from "@/components/Game";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Logged out successfully");
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
      {/* Logout button positioned in middle-right */}
      <div className="absolute top-1/2 -translate-y-1/2 right-4 z-50">
        <Button
          onClick={handleSignOut}
          variant="outline"
          size="sm"
          className="bg-black/50 backdrop-blur-sm border-primary/20 hover:bg-destructive/10 text-destructive"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
      
      <Game />
    </div>
  );
};

export default Index;
