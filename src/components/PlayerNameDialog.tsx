
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { User, Rocket } from "lucide-react";

interface PlayerNameDialogProps {
  open: boolean;
  onSubmit: (name: string) => void;
  onClose?: () => void;
}

const PlayerNameDialog: React.FC<PlayerNameDialogProps> = ({ open, onSubmit, onClose }) => {
  const [isOpen, setIsOpen] = useState(open);
  
  const form = useForm({
    defaultValues: {
      playerName: localStorage.getItem('playerName') || ""
    }
  });
  
  useEffect(() => {
    setIsOpen(open);
  }, [open]);
  
  const handleSubmit = form.handleSubmit((data) => {
    localStorage.setItem('playerName', data.playerName);
    onSubmit(data.playerName);
    setIsOpen(false);
  });
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open && onClose) {
      onClose();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-black/90 text-white border-purple-500/30 backdrop-blur-lg"
                    style={{
                      boxShadow: "0 0 20px rgba(155, 135, 245, 0.4)",
                    }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-robot9000">
            <Rocket className="text-purple-400" />
            Pilot Registration
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Enter your name to track your high scores
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="playerName"
              rules={{ required: "Pilot name is required", minLength: { value: 2, message: "Name must be at least 2 characters" } }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Pilot Name</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2 bg-black/50 border border-purple-500/30 rounded-md px-3 py-1">
                      <User size={18} className="text-purple-400" />
                      <Input className="border-0 bg-transparent text-white focus-visible:ring-0 focus-visible:ring-offset-0"
                            placeholder="Enter your name" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600">
                Start Mission
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerNameDialog;
