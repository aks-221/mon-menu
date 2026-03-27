import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="text-xl font-extrabold">
          Menu<span className="text-primary">Up</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Fonctionnalités
          </a>
          <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Tarifs
          </a>
          <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Témoignages
          </a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">Connexion</Button>
          </Link>
          <Link to="/register">
            <Button size="sm" className="gradient-primary text-primary-foreground shadow-warm rounded-lg">
              Créer mon restaurant
            </Button>
          </Link>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-3">
          <a href="#features" className="block text-sm font-medium py-2" onClick={() => setOpen(false)}>Fonctionnalités</a>
          <a href="#pricing" className="block text-sm font-medium py-2" onClick={() => setOpen(false)}>Tarifs</a>
          <a href="#testimonials" className="block text-sm font-medium py-2" onClick={() => setOpen(false)}>Témoignages</a>
          <div className="pt-2 space-y-2">
            <Link to="/login" className="block">
              <Button variant="outline" className="w-full">Connexion</Button>
            </Link>
            <Link to="/register" className="block">
              <Button className="w-full gradient-primary text-primary-foreground">Créer mon restaurant</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
