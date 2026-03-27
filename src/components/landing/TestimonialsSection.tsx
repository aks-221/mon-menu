import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Fatou Diallo",
    role: "Gérante, Chez Fatou",
    text: "Grâce à MenuUp, mes clients consultent mon menu avant de venir. J'ai gagné 30% de commandes en plus via WhatsApp !",
    rating: 5,
  },
  {
    name: "Moussa Ndiaye",
    role: "Propriétaire, Fast Grill Dakar",
    text: "En 10 minutes, j'avais ma page en ligne. Mes clients scannent le QR code directement sur mes tables.",
    rating: 5,
  },
  {
    name: "Aïssatou Sow",
    role: "Chef, Le Teranga",
    text: "Simple, rapide, et mes clients adorent. Le bouton WhatsApp a changé ma façon de prendre les commandes.",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-cream" id="testimonials">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Ils utilisent{" "}
            <span className="text-gradient">MenuUp</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Des restaurateurs comme vous ont déjà fait le pas.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl p-6 shadow-card"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-warning text-warning" />
                ))}
              </div>
              <p className="text-sm leading-relaxed mb-4 text-foreground/80">"{t.text}"</p>
              <div>
                <p className="font-bold text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
