import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/" className="text-2xl font-extrabold">
            Menu<span className="text-primary">Up</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold">Bon retour ! 👋</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Connectez-vous à votre espace restaurant
          </p>
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl py-5"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl py-5"
            />
          </div>
          <Link to="/dashboard">
            <Button className="w-full gradient-primary text-primary-foreground shadow-warm rounded-xl py-5 mt-2">
              Se connecter
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Pas encore de compte ?{" "}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Créer un restaurant
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
