import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Smartphone } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SubscribeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurant: any;
  onSuccess: () => void;
}

const SubscribeModal = ({ open, onOpenChange, restaurant, onSuccess }: SubscribeModalProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const reference = `SAMAMENU-${restaurant.id}-${Date.now()}`;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      // 1. Enregistrer en pending dans Supabase
      const { error: dbError } = await supabase.from("subscriptions").upsert({
        restaurant_id: restaurant.id,
        status: "pending",
        plan_name: "pro",
        price: 6600,
        starts_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        payment_method: "senepay",
        payment_reference: reference,
      }, { onConflict: "restaurant_id" });

      if (dbError) throw dbError;

      // 2. Appeler la Edge Function
      const { data: sessionData, error: sessionError } = await supabase.functions.invoke(
        "create-payment",
        {
          body: JSON.stringify({
            restaurant_id: restaurant.id,
            restaurant_name: restaurant.name,
            amount: 6600,
            reference,
            payment_method: "wave",
          }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (sessionError) throw sessionError;
      if (!sessionData?.payment_url) throw new Error("URL de paiement introuvable");

      // 3. Rediriger vers SenePay
      window.location.href = sessionData.payment_url;

    } catch (err: any) {
      console.error("Erreur paiement:", err);
      toast({
        title: "Erreur",
        description: err.message || "Impossible d'initier le paiement. Réessayez.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">
            S'abonner à SamaMenu Pro
          </DialogTitle>
          <DialogDescription>
            Accès complet à toutes les fonctionnalités pour 6 600 FCFA / mois
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Fonctionnalités incluses */}
          <div className="bg-muted/50 rounded-xl p-4 space-y-2">
            {[
              "Menu illimité",
              "Commandes & livraison",
              "Statistiques & graphiques",
              "QR Code & reçus PDF",
              "Réservations",
              "Notifications WhatsApp",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </div>

          {/* Bouton unique */}
          <Button
            className="w-full justify-center gap-3 py-5 rounded-xl gradient-primary text-primary-foreground"
            onClick={handleSubscribe}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Smartphone className="h-5 w-5" />
            )}
            <div className="text-left">
              <div className="font-medium">Payer mon abonnement</div>
              <div className="text-xs opacity-80">
                Wave • Orange Money • Free Money • E-money
              </div>
            </div>
          </Button>

          {loading && (
            <p className="text-center text-sm text-muted-foreground animate-pulse">
              Redirection vers le paiement en cours...
            </p>
          )}

          <p className="text-center text-xs text-muted-foreground">
            🔒 Paiement sécurisé — Activation instantanée après confirmation
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscribeModal;