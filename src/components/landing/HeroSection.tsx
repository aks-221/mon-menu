import { motion } from "framer-motion";
import { ArrowRight, Smartphone, MapPin, Clock, Plus, Phone, Star, ChevronDown } from "lucide-react";
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
            <div className="relative mx-auto w-[280px] h-[580px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl border border-gray-700">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-10" />
              <div className="w-full h-full bg-white rounded-[2.2rem] overflow-hidden flex flex-col">
                
                {/* Hero image area */}
                <div className="relative h-[180px] bg-gradient-to-br from-gray-800 to-gray-950 overflow-hidden">
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2 border border-white/30">
                      <span className="text-xl">🍽️</span>
                    </div>
                    <p className="text-white font-bold text-sm italic">Chez Fatou</p>
                    <p className="text-gray-300 text-[10px] mt-0.5">Restaurant Sénégalais</p>
                    <span className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-semibold text-white bg-green-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-200 animate-pulse" />
                      Ouvert
                    </span>
                  </div>
                </div>

                {/* Category tabs */}
                <div className="flex gap-1.5 px-3 py-2.5 overflow-hidden">
                  {["Tout", "Entrées", "Plats", "Boissons"].map((cat, i) => (
                    <span
                      key={cat}
                      className="text-[9px] px-2.5 py-1.5 rounded-full font-semibold whitespace-nowrap"
                      style={i === 0
                        ? { backgroundColor: "#16a34a", color: "#fff" }
                        : { backgroundColor: "#f3f4f6", color: "#374151" }
                      }
                    >
                      {cat}
                    </span>
                  ))}
                </div>

                {/* Dish cards */}
                <div className="flex-1 px-3 space-y-2 overflow-hidden">
                  {[
                    { name: "Thiéboudienne", price: "2 500", popular: true },
                    { name: "Yassa Poulet", price: "2 000", popular: false },
                    { name: "Mafé", price: "1 800", popular: false },
                  ].map((dish) => (
                    <div key={dish.name} className="flex items-center gap-2.5 p-2 rounded-xl border border-gray-100 hover:shadow-sm">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-100 to-orange-50 flex-shrink-0 flex items-center justify-center text-lg">
                        🍛
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-[10px] font-bold text-gray-900 truncate">{dish.name}</p>
                          {dish.popular && (
                            <span className="text-[7px] font-bold px-1.5 py-0.5 rounded bg-green-500 text-white flex-shrink-0">
                              Populaire
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-[10px] font-bold text-green-600">{dish.price} FCFA</p>
                          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                            <Plus className="h-3 w-3 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* WhatsApp CTA */}
                <div className="p-3">
                  <div className="w-full py-2.5 rounded-full bg-green-500 text-white text-center text-[10px] font-bold flex items-center justify-center gap-1.5 shadow-lg">
                    <Phone className="h-3 w-3" />
                    Commander sur WhatsApp
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
