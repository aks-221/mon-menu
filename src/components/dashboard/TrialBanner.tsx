import { Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TrialBannerProps {
  daysLeft: number;
  isSubscribed: boolean;
  onSubscribe: () => void;
}

const TrialBanner = ({ daysLeft, isSubscribed, onSubscribe }: TrialBannerProps) => {
  if (isSubscribed) return null;

  const urgent = daysLeft <= 3;

  return (
    <div className={`rounded-xl px-4 py-3 flex items-center justify-between gap-3 mb-4 ${
      urgent 
        ? "bg-destructive/10 border border-destructive/30" 
        : "bg-primary/10 border border-primary/20"
    }`}>
      <div className="flex items-center gap-2">
        <Clock className={`h-4 w-4 ${urgent ? "text-destructive" : "text-primary"}`} />
        <span className={`text-sm font-medium ${urgent ? "text-destructive" : "text-primary"}`}>
          {daysLeft > 0
            ? `Il vous reste ${daysLeft} jour${daysLeft > 1 ? "s" : ""} d'essai gratuit`
            : "Votre essai gratuit est terminé"}
        </span>
      </div>
      <Button size="sm" className="gradient-primary text-primary-foreground rounded-lg gap-1.5" onClick={onSubscribe}>
        <Zap className="h-3.5 w-3.5" />
        S'abonner
      </Button>
    </div>
  );
};

export default TrialBanner;
