import { useState, useEffect } from "react";
import { Eye, MessageCircle, TrendingUp, DollarSign, ShoppingBag, CalendarDays, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const StatsView = ({ restaurant }: { restaurant: any }) => {
  const [stats, setStats] = useState({
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    totalOrders: 0,
    todayOrders: 0,
    weekOrders: 0,
    pendingOrders: 0,
    totalReservations: 0,
    pendingReservations: 0,
  });
  const [topDishes, setTopDishes] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!restaurant?.id) return;
    const load = async () => {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 1).toISOString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      // Fetch all orders for this restaurant
      const { data: orders } = await supabase
        .from("orders")
        .select("id, total, status, created_at")
        .eq("restaurant_id", restaurant.id);

      const allOrders = orders || [];
      const completed = allOrders.filter(o => !["annulee"].includes(o.status));
      const todayOrders = completed.filter(o => o.created_at >= todayStart);
      const weekOrders = completed.filter(o => o.created_at >= weekStart);
      const monthOrders = completed.filter(o => o.created_at >= monthStart);
      const pending = allOrders.filter(o => o.status === "en_attente");

      const sum = (arr: any[]) => arr.reduce((s, o) => s + (o.total || 0), 0);

      // Top dishes
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("dish_name, quantity, order_id");

      const orderIds = new Set(allOrders.map(o => o.id));
      const relevant = (orderItems || []).filter(i => orderIds.has(i.order_id));
      const dishMap: Record<string, number> = {};
      relevant.forEach(i => {
        dishMap[i.dish_name] = (dishMap[i.dish_name] || 0) + i.quantity;
      });
      const top = Object.entries(dishMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      // Reservations
      const { count: totalRes } = await supabase
        .from("reservations").select("id", { count: "exact", head: true })
        .eq("restaurant_id", restaurant.id);
      const { count: pendingRes } = await supabase
        .from("reservations").select("id", { count: "exact", head: true })
        .eq("restaurant_id", restaurant.id).eq("status", "en_attente");

      setStats({
        todayRevenue: sum(todayOrders),
        weekRevenue: sum(weekOrders),
        monthRevenue: sum(monthOrders),
        totalOrders: allOrders.length,
        todayOrders: todayOrders.length,
        weekOrders: weekOrders.length,
        pendingOrders: pending.length,
        totalReservations: totalRes || 0,
        pendingReservations: pendingRes || 0,
      });
      setTopDishes(top);
      setLoading(false);
    };
    load();
  }, [restaurant?.id]);

  const fmt = (n: number) => n.toLocaleString("fr-FR");

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div><h1 className="text-2xl font-bold">Statistiques</h1></div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border p-5 animate-pulse h-28" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Statistiques</h1>
        <p className="text-muted-foreground text-sm">Suivez les performances de votre restaurant.</p>
      </div>

      {/* Revenue */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">💰 Chiffre d'affaires</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Aujourd'hui", value: stats.todayRevenue },
            { label: "Cette semaine", value: stats.weekRevenue },
            { label: "Ce mois", value: stats.monthRevenue },
          ].map(s => (
            <div key={s.label} className="bg-card rounded-2xl border border-border p-5">
              <DollarSign className="h-5 w-5 text-primary mb-2" />
              <p className="text-xl md:text-2xl font-bold">{fmt(s.value)} <span className="text-sm font-normal text-muted-foreground">FCFA</span></p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Orders */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">📦 Commandes</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total", value: stats.totalOrders, icon: Package },
            { label: "Aujourd'hui", value: stats.todayOrders, icon: ShoppingBag },
            { label: "Cette semaine", value: stats.weekOrders, icon: CalendarDays },
            { label: "En attente", value: stats.pendingOrders, icon: TrendingUp },
          ].map(s => (
            <div key={s.label} className="bg-card rounded-2xl border border-border p-4">
              <s.icon className="h-5 w-5 text-primary mb-2" />
              <p className="text-2xl font-bold">{fmt(s.value)}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Reservations summary */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">📅 Réservations</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card rounded-2xl border border-border p-4">
            <CalendarDays className="h-5 w-5 text-accent mb-2" />
            <p className="text-2xl font-bold">{fmt(stats.totalReservations)}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4">
            <MessageCircle className="h-5 w-5 text-accent mb-2" />
            <p className="text-2xl font-bold">{fmt(stats.pendingReservations)}</p>
            <p className="text-xs text-muted-foreground">En attente</p>
          </div>
        </div>
      </div>

      {/* Top dishes */}
      {topDishes.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-bold">Plats les plus commandés</h3>
          </div>
          <div className="space-y-3">
            {topDishes.map((dish, i) => (
              <div key={dish.name} className="flex items-center gap-3">
                <span className="text-sm font-bold text-muted-foreground w-6">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{dish.name}</span>
                    <span className="text-xs text-muted-foreground">{dish.count} commandés</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="gradient-primary h-2 rounded-full transition-all"
                      style={{ width: `${(dish.count / (topDishes[0]?.count || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsView;
