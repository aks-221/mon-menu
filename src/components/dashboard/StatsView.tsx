import { Eye, MessageCircle, TrendingUp } from "lucide-react";

const StatsView = () => {
  const topDishes = [
    { name: "Thiéboudienne", views: 89 },
    { name: "Yassa Poulet", views: 67 },
    { name: "Bissap", views: 54 },
    { name: "Mafé", views: 43 },
    { name: "Pastels", views: 31 },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Statistiques</h1>
        <p className="text-muted-foreground text-sm">Suivez les performances de votre page.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl border border-border p-5">
          <Eye className="h-5 w-5 text-primary mb-2" />
          <p className="text-3xl font-bold">342</p>
          <p className="text-sm text-muted-foreground">Vues ce mois</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5">
          <MessageCircle className="h-5 w-5 text-accent mb-2" />
          <p className="text-3xl font-bold">47</p>
          <p className="text-sm text-muted-foreground">Clics WhatsApp</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-bold">Plats les plus consultés</h3>
        </div>
        <div className="space-y-3">
          {topDishes.map((dish, i) => (
            <div key={dish.name} className="flex items-center gap-3">
              <span className="text-sm font-bold text-muted-foreground w-6">{i + 1}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{dish.name}</span>
                  <span className="text-xs text-muted-foreground">{dish.views} vues</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="gradient-primary h-2 rounded-full transition-all"
                    style={{ width: `${(dish.views / 89) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsView;
