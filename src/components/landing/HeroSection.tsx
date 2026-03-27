import { motion } from "framer-motion";
import { ArrowRight, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center gradient-hero overflow-hidden">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Smartphone className="h-4 w-4" />
              <span>Optimisé pour le mobile</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
              Créez le site de votre restaurant{" "}
              <span className="text-gradient">gratuitement</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg">
              MenuUp permet à n'importe quel restaurant de créer une page professionnelle 
              avec menu, localisation et bouton WhatsApp — en quelques minutes seulement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button size="lg" className="gradient-primary text-primary-foreground shadow-warm text-base px-8 py-6 rounded-xl">
                  Commencer gratuitement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button variant="outline" size="lg" className="text-base px-8 py-6 rounded-xl border-2">
                  Voir une démo
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              ✓ Gratuit — ✓ Sans carte bancaire — ✓ En ligne en 5 minutes
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative hidden md:block"
          >
            <div className="relative mx-auto w-[280px] h-[560px] bg-foreground rounded-[3rem] p-3 shadow-2xl">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-foreground rounded-b-2xl z-10" />
              <div className="w-full h-full bg-card rounded-[2.2rem] overflow-hidden flex flex-col">
                <div className="bg-primary p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary-foreground/20 mx-auto mb-2" />
                  <p className="text-primary-foreground font-bold text-sm">Chez Fatou</p>
                  <p className="text-primary-foreground/70 text-xs">Restaurant Sénégalais</p>
                </div>
                <div className="flex-1 p-3 space-y-2 overflow-hidden">
                  <div className="flex gap-2">
                    {["Entrées", "Plats", "Boissons"].map((cat) => (
                      <span key={cat} className="text-xs px-3 py-1 rounded-full bg-secondary font-medium">
                        {cat}
                      </span>
                    ))}
                  </div>
                  {[
                    { name: "Thiéboudienne", price: "2 500" },
                    { name: "Yassa Poulet", price: "2 000" },
                    { name: "Mafé", price: "1 800" },
                  ].map((dish) => (
                    <div key={dish.name} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{dish.name}</p>
                        <p className="text-xs text-primary font-bold">{dish.price} FCFA</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3">
                  <div className="w-full py-2.5 rounded-xl bg-success text-success-foreground text-center text-xs font-bold">
                    📱 Commander sur WhatsApp
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -z-10 top-10 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -z-10 bottom-10 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
