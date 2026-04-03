import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, MessageSquare, CreditCard, Smartphone } from "lucide-react";
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
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const { toast } = useToast();

  const WAVE_PAYMENT_LINK = "https://pay.wave.com/m/M_sn_n03HK-9PsJV3/c/sn/?amount=6600";

  const handleSubscribe = async (method: string) => {
    setLoading(true);
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const { error } = await supabase.from("subscriptions").upsert({
        restaurant_id: restaurant.id,
        status: "pending",
        plan_name: "pro",
        price: 6600,
        starts_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      }, { onConflict: "restaurant_id" });

      if (error) throw error;

      if (method === "Wave") {
        window.open(WAVE_PAYMENT_LINK, "_blank");
      }

      setPaymentMethod(method);
      setPaymentInitiated(true);
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Réessayez.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendProof = () => {
    const proofMsg = encodeURIComponent(
      `Bonjour, je viens de payer mon abonnement SamaMenu Pro (6 600 FCFA/mois).\n\nRestaurant: ${restaurant.name}\nMéthode: ${paymentMethod}\n\nVeuillez trouver ci-joint la capture du paiement.`
    );
    window.open(`https://wa.me/221778177575?text=${proofMsg}`, "_blank");

    toast({
      title: "Merci !",
      description: "Envoyez la capture de paiement via WhatsApp pour activation immédiate.",
    });

    onSuccess();
    onOpenChange(false);
    setPaymentInitiated(false);
    setPaymentMethod("");
  };

  const handleClose = (val: boolean) => {
    if (!val) {
      setPaymentInitiated(false);
      setPaymentMethod("");
    }
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">S'abonner à SamaMenu Pro</DialogTitle>
          <DialogDescription>
            Accès complet à toutes les fonctionnalités pour 6 600 FCFA / mois
          </DialogDescription>
        </DialogHeader>

        {!paymentInitiated ? (
          <div className="space-y-4 pt-2">
            <div className="bg-muted/50 rounded-xl p-4 space-y-2">
              {["Menu illimité", "Commandes & livraison", "Statistiques", "QR Code & reçus PDF"].map(f => (
                <div key={f} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{f}</span>
                </div>
              ))}
            </div>

            <p className="text-sm text-muted-foreground text-center">Choisissez votre méthode de paiement :</p>

            <div className="grid gap-2">
              <Button
                className="w-full justify-start gap-3 py-5 rounded-xl gradient-primary text-primary-foreground"
                onClick={() => handleSubscribe("Wave")}
                disabled={loading}
              >
                <Smartphone className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Payer avec Wave</div>
                  <div className="text-xs opacity-80">Paiement mobile instantané</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-3 py-5 rounded-xl"
                onClick={() => handleSubscribe("Virement")}
                disabled={loading}
              >
                <CreditCard className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <div className="font-medium">Virement bancaire</div>
                  <div className="text-xs text-muted-foreground">Par transfert</div>
                </div>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-2 text-center">
            <div className="bg-primary/10 rounded-xl p-6 space-y-3">
              <Check className="h-10 w-10 text-primary mx-auto" />
              <p className="font-semibold text-lg">Paiement effectué ?</p>
              <p className="text-sm text-muted-foreground">
                Après avoir payé, envoyez une capture d'écran via WhatsApp pour activer votre abonnement immédiatement.
              </p>
            </div>

            <Button
              className="w-full gap-2 py-5 rounded-xl bg-green-600 hover:bg-green-700 text-white"
              onClick={handleSendProof}
            >
              <MessageSquare className="h-5 w-5" />
              J'ai payé — Envoyer la preuve via WhatsApp
            </Button>

            <Button
              variant="ghost"
              className="w-full text-sm text-muted-foreground"
              onClick={() => setPaymentInitiated(false)}
            >
              ← Retour
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SubscribeModal;
