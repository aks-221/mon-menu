import { UtensilsCrossed, Eye, TrendingUp, MessageCircle } from "lucide-react";

const DashboardHome = ({ onNavigate }: { onNavigate: (tab: string) => void }) => {
  const stats = [
    { label: "Vues ce mois", value: "342", icon: Eye, change: "+12%" },
    { label: "Plats actifs", value: "15", icon: UtensilsCrossed, change: "" },
    { label: "Plat populaire", value: "Thiéboudienne", icon: TrendingUp, change: "89 vues" },
    { label: "Clics WhatsApp", value: "47", icon: MessageCircle, change: "+8%" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bonjour, Fatou ! 👋</h1>
        <p className="text-muted-foreground text-sm">Voici un aperçu de votre restaurant.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-card rounded-2xl p-4 border border-border shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <s.icon className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            {s.change && <p className="text-xs text-accent font-medium mt-1">{s.change}</p>}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <button
          onClick={() => onNavigate("menu")}
          className="bg-card rounded-2xl p-6 border border-border shadow-card text-left hover:shadow-warm transition-shadow"
        >
          <UtensilsCrossed className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-bold mb-1">Gérer votre menu</h3>
          <p className="text-sm text-muted-foreground">Ajoutez, modifiez ou désactivez vos plats.</p>
        </button>
        <button
          onClick={() => onNavigate("profile")}
          className="bg-card rounded-2xl p-6 border border-border shadow-card text-left hover:shadow-warm transition-shadow"
        >
          <MessageCircle className="h-8 w-8 text-accent mb-3" />
          <h3 className="font-bold mb-1">Configurer WhatsApp</h3>
          <p className="text-sm text-muted-foreground">Vérifiez votre numéro et personnalisez le message.</p>
        </button>
      </div>
    </div>
  );
};

export default DashboardHome;
