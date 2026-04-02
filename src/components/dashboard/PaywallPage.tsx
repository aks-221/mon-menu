import { Lock, Zap, Check, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaywallPageProps {
  onSubscribe: () => void;
}

const features = [
  "Gestion complète du menu",
  "Commandes en ligne illimitées",
  "Zones de livraison",
  "Réservations",
  "Statistiques & graphiques",
  "QR Code téléchargeable",
  "Reçus PDF",
  "Notifications WhatsApp",
];

const PaywallPage = ({ onSubscribe }: PaywallPageProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <Lock className="h-8 w-8 text-destructive" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold">Votre essai est terminé</h1>
          <p className="text-muted-foreground">
            Abonnez-vous pour continuer à utiliser SamaMenu et développer votre restaurant.
          </p>
        </div>

        <div className="bg-card border-2 border-primary rounded-2xl p-6 text-left space-y-5">
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Plan SamaMenu Pro</div>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-extrabold">6 600</span>
              <span className="text-muted-foreground text-sm">FCFA / mois</span>
            </div>
          </div>

          <ul className="space-y-2.5">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <Button 
            className="w-full gradient-primary text-primary-foreground rounded-xl py-5 gap-2"
            onClick={onSubscribe}
          >
            <Zap className="h-4 w-4" />
            S'abonner maintenant
          </Button>

          <div className="text-center">
            <a
              href="https://wa.me/221700000000?text=Bonjour%2C%20je%20souhaite%20m'abonner%20à%20SamaMenu"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              Besoin d'aide ? Contactez-nous sur WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaywallPage;
