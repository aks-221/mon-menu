import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Remplissez tous les champs");
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setLoading(false);
      toast.error("Email ou mot de passe incorrect");
      return;
    }
    // Check if user is admin
    const { data: { user: loggedUser } } = await supabase.auth.getUser();
    if (loggedUser) {
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", loggedUser.id).eq("role", "admin");
      if (roles && roles.length > 0) {
        setLoading(false);
        navigate("/admin");
        return;
      }
    }
    setLoading(false);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/" className="text-2xl font-extrabold">
            Sama<span className="text-primary">Menu</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold">Bon retour ! 👋</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Connectez-vous à votre espace restaurant
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="votre@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl py-5" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-xl py-5" />
          </div>
          <Button type="submit" disabled={loading} className="w-full gradient-primary text-primary-foreground shadow-warm rounded-xl py-5">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Se connecter <ArrowRight className="ml-2 h-4 w-4" /></>}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Pas encore de compte ?{" "}
          <Link to="/register" className="text-primary font-semibold hover:underline">Créer un restaurant</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
