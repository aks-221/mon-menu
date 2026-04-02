import { motion } from "framer-motion";
import { Check, Zap, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const features = [
  "Plats illimités",
  "Commandes en ligne",
  "Zones de livraison",
  "Réservations",
  "Statistiques & graphiques",
  "QR Code téléchargeable",
  "Reçus PDF",
  "Notifications WhatsApp",
  "Page publique personnalisée",
  "Sans branding MenuUp",
];

const PricingSection = () => {
  return (
    <section className="py-20" id="pricing">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Essayez 15 jours,{" "}
            <span className="text-gradient">puis décidez</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Accès complet pendant 15 jours, sans carte bancaire. Continuez à seulement 6 600 FCFA/mois.
          </p>
        </motion.div>

        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl p-8 border-2 border-primary shadow-warm bg-card"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5">
              <Gift className="h-3.5 w-3.5" />
              15 jours gratuits
            </div>

            <div className="text-center mb-6">
              <h3 className="text-lg font-bold mb-1">MenuUp Pro</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Tout ce qu'il faut pour gérer votre restaurant en ligne
              </p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-extrabold">6 600</span>
                <span className="text-muted-foreground text-sm">FCFA / mois</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Après la période d'essai gratuite de 15 jours
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Link to="/register">
              <Button className="w-full gradient-primary text-primary-foreground rounded-xl py-6 text-base gap-2 shadow-warm">
                <Zap className="h-4 w-4" />
                Commencer l'essai gratuit
              </Button>
            </Link>

            <p className="text-xs text-center text-muted-foreground mt-4">
              Aucune carte bancaire requise • Annulez à tout moment
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
