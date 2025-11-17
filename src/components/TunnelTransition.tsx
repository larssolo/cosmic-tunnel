interface TunnelTransitionProps {
  isActive: boolean;
}

export const TunnelTransition = ({ isActive }: TunnelTransitionProps) => {
  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none animate-fade-in">
      <div className="text-center">
        <h1 className="text-6xl md:text-8xl font-bold text-primary animate-pulse mb-4">
          ENTERING TUNNEL
        </h1>
        <div className="w-64 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto animate-pulse" />
      </div>
    </div>
  );
};
