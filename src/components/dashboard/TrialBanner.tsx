import { Clock, Zap, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TrialBannerProps {
  daysLeft: number;
  isSubscribed: boolean;
  subscriptionDaysLeft: number;
  subscriptionExpiresAt?: string;
  onSubscribe: () => void;
}

const TrialBanner = ({
  daysLeft,
  isSubscribed,
  subscriptionDaysLeft,
  subscriptionExpiresAt,
  onSubscribe,
}: TrialBannerProps) => {

  // Abonnement actif — afficher infos expiration
  if (isSubscribed) {
    const expiresDate = subscriptionExpiresAt
      ? new Date(subscriptionExpiresAt).toLocaleDateString("fr-FR", {
          day: "numeric", month: "long", year: "numeric"
        })
      : "";

    const expireSoon = subscriptionDaysLeft <= 5;

    return (
      <div className={`rounded-xl px-4 py-3 mb-4 ${
        expireSoon
          ? "bg-destructive/10 border border-destructive/30"
          : "bg-green-500/10 border border-green-500/20"
      }`}>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            {expireSoon ? (
              <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
            ) : (
              <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
            )}
            <span className={`text-sm font-medium leading-snug ${
              expireSoon ? "text-destructive" : "text-green-700"
            }`}>
              {expireSoon
                ? `⚠️ Abonnement expire dans ${subscriptionDaysLeft} jour${subscriptionDaysLeft > 1 ? "s" : ""}`
                : `✅ Abonnement actif — expire le ${expiresDate}`
              }
            </span>
          </div>
          {expireSoon && (
            <Button
              size="sm"
              className="gradient-primary text-primary-foreground rounded-lg gap-1.5 shrink-0"
              onClick={onSubscribe}
            >
              <Zap className="h-3.5 w-3.5" />
              Renouveler
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Période d'essai
  const urgent = daysLeft <= 3;

  return (
    <div className={`rounded-xl px-4 py-3 mb-4 ${
      urgent
        ? "bg-destructive/10 border border-destructive/30"
        : "bg-primary/10 border border-primary/20"
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <Clock className={`h-4 w-4 shrink-0 ${urgent ? "text-destructive" : "text-primary"}`} />
        <span className={`text-sm font-medium leading-snug ${urgent ? "text-destructive" : "text-primary"}`}>
          {daysLeft > 0
            ? `Il vous reste ${daysLeft} jour${daysLeft > 1 ? "s" : ""} d'essai gratuit`
            : "Votre essai gratuit est terminé"}
        </span>
      </div>
      <Button
        size="sm"
        className="w-full gradient-primary text-primary-foreground rounded-lg gap-1.5"
        onClick={onSubscribe}
      >
        <Zap className="h-3.5 w-3.5" />
        S'abonner maintenant
      </Button>
    </div>
  );
};

export default TrialBanner;