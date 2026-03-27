import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Gratuit",
    price: "0",
    period: "",
    description: "Parfait pour commencer",
    features: [
      "1 restaurant",
      "Jusqu'à 20 plats",
      "Page publique",
      "Bouton WhatsApp",
      "Branding MenuUp",
    ],
    cta: "Commencer gratuitement",
    popular: false,
  },
  {
    name: "Pro",
    price: "3 000",
    period: "/ mois",
    description: "Pour les restaurants sérieux",
    features: [
      "Plats illimités",
      "QR Code téléchargeable",
      "Statistiques de vues",
      "Sans branding MenuUp",
      "Couleur personnalisée",
      "Support par email",
    ],
    cta: "Passer au Pro",
    popular: true,
  },
  {
    name: "Business",
    price: "6 000",
    period: "/ mois",
    description: "Pour les chaînes & groupes",
    features: [
      "Plusieurs restaurants",
      "Statistiques avancées",
      "Support prioritaire",
      "Personnalisation complète",
      "Tout le plan Pro inclus",
    ],
    cta: "Nous contacter",
    popular: false,
  },
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
            Des prix pensés pour{" "}
            <span className="text-gradient">l'Afrique</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Commencez gratuitement, évoluez à votre rythme. Tous les prix sont en FCFA.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl p-6 border-2 transition-all ${
                plan.popular
                  ? "border-primary shadow-warm bg-card scale-105"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-primary text-primary-foreground text-xs font-bold">
                  Populaire
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">FCFA {plan.period}</span>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/register">
                <Button
                  className={`w-full rounded-xl py-5 ${
                    plan.popular ? "gradient-primary text-primary-foreground shadow-warm" : ""
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
