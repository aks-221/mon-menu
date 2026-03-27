import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";

const Register = () => {
  const [step, setStep] = useState(1);
  const [restaurantName, setRestaurantName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [cuisineType, setCuisineType] = useState("");

  const cuisineTypes = [
    "🍛 Cuisine locale", "🍔 Fast-food", "🥘 Dibiterie",
    "☕ Café / Salon de thé", "🍕 Pizzeria", "🌮 Food Truck", "🍽️ Autre"
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/" className="text-2xl font-extrabold">
            Menu<span className="text-primary">Up</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold">
            {step === 1 ? "Créez votre restaurant 🚀" : "Presque fini !"}
          </h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Étape {step} sur 2
          </p>
          <div className="flex gap-2 mt-4 max-w-[120px] mx-auto">
            <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
            <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
          </div>
        </div>

        {step === 1 ? (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
            <div className="space-y-2">
              <Label>Nom du restaurant</Label>
              <Input
                placeholder="ex: Chez Fatou"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                className="rounded-xl py-5"
              />
            </div>
            <div className="space-y-2">
              <Label>Type de cuisine</Label>
              <div className="grid grid-cols-2 gap-2">
                {cuisineTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setCuisineType(type)}
                    className={`text-left text-sm px-3 py-2.5 rounded-xl border-2 transition-all ${
                      cuisineType === type
                        ? "border-primary bg-primary/5 font-medium"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Numéro WhatsApp</Label>
              <Input
                placeholder="+221 77 000 00 00"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-xl py-5"
              />
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground shadow-warm rounded-xl py-5">
              Continuer
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl py-5"
              />
            </div>
            <div className="space-y-2">
              <Label>Mot de passe</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl py-5"
              />
            </div>
            <Link to="/dashboard">
              <Button className="w-full gradient-primary text-primary-foreground shadow-warm rounded-xl py-5 mt-2">
                Créer mon restaurant
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <button onClick={() => setStep(1)} className="w-full text-sm text-muted-foreground hover:text-foreground">
              ← Retour
            </button>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground">
          Déjà un compte ?{" "}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
