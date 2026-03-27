import { motion } from "framer-motion";
import { Smartphone, QrCode, MessageCircle, Clock, BarChart3, Palette } from "lucide-react";

const features = [
  {
    icon: Smartphone,
    title: "Page mobile optimisée",
    description: "Un site professionnel qui s'affiche parfaitement sur tous les téléphones.",
  },
  {
    icon: MessageCircle,
    title: "Commandes WhatsApp",
    description: "Vos clients commandent directement via WhatsApp avec un message pré-rempli.",
  },
  {
    icon: QrCode,
    title: "QR Code automatique",
    description: "Générez un QR code pour vos tables, flyers ou vitrines en un clic.",
  },
  {
    icon: Clock,
    title: "Horaires & disponibilité",
    description: "Affichez vos horaires et le statut ouvert/fermé automatiquement.",
  },
  {
    icon: BarChart3,
    title: "Statistiques simples",
    description: "Voyez combien de personnes consultent votre menu chaque jour.",
  },
  {
    icon: Palette,
    title: "Personnalisation facile",
    description: "Choisissez vos couleurs et votre thème en quelques clics.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-card" id="features">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Tout ce qu'il faut pour{" "}
            <span className="text-gradient">votre restaurant</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Pas besoin de compétences techniques. MenuUp s'occupe de tout.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-6 rounded-2xl bg-background border border-border hover:shadow-warm transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
