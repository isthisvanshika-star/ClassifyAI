import { Loader2 } from "lucide-react";

const LoadingState = () => {
  return (
    <div className="flex flex-col justify-center items-center h-[80vh] gap-3">
      <Loader2 size={40} className="text-cyan-400 animate-spin" />
      <p className="text-cyan-300 animate-pulse">
        Loading Assignment...
      </p>
    </div>
  );
};

export default LoadingState;