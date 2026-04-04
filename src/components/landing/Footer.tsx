import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background/80 py-12">
      <div className="container mx-auto px-4">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="space-y-3">
            <h3 className="text-xl font-extrabold text-background">
              Sama<span className="text-primary">Menu</span>
            </h3>
            <p className="text-sm text-background/60 leading-relaxed">
              La solution la plus simple pour mettre votre restaurant en ligne au Sénégal.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-background text-sm">Produit</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="hover:text-primary transition-colors">Fonctionnalités</a></li>
              <li><a href="#pricing" className="hover:text-primary transition-colors">Tarifs</a></li>
              <li><a href="#testimonials" className="hover:text-primary transition-colors">Témoignages</a></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-background text-sm">Légal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terms" className="hover:text-primary transition-colors">Conditions d'utilisation</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Confidentialité</Link></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-background text-sm">Contact</h4>
            <a
              href="https://wa.me/221778177575"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm hover:text-primary transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </div>
        <div className="border-t border-background/10 pt-6 text-center text-xs text-background/40">
          © {new Date().getFullYear()} SamaMenu. Fait avec ❤️ au Sénégal.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
