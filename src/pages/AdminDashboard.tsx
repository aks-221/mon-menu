import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard, Store, Users, BarChart3, Loader2, LogOut,
  Eye, Search, ArrowUpRight, TrendingUp, CreditCard, CheckCircle, XCircle, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "restaurants" | "users" | "subscriptions">("overview");

  // Stats
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    publishedRestaurants: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalReservations: 0,
    todayOrders: 0,
    todayRevenue: 0,
  });
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!authLoading && !user) { navigate("/login"); return; }
    if (user) checkAdmin();
  }, [user, authLoading]);

  const checkAdmin = async () => {
    const { data } = await supabase.rpc("has_role", { _user_id: user!.id, _role: "admin" });
    if (!data) { navigate("/dashboard"); return; }
    setIsAdmin(true);
    await loadData();
    setLoading(false);
  };

  const loadData = async () => {
    const today = new Date().toISOString().split("T")[0];

    const [restos, orders, reservations] = await Promise.all([
      supabase.from("restaurants").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("id, total, status, created_at"),
      supabase.from("reservations").select("id", { count: "exact", head: true }),
    ]);

    const allRestos = restos.data || [];
    const allOrders = orders.data || [];
    const todayOrders = allOrders.filter(o => o.created_at?.startsWith(today));

    setRestaurants(allRestos);
    setStats({
      totalRestaurants: allRestos.length,
      publishedRestaurants: allRestos.filter(r => r.is_published).length,
      totalOrders: allOrders.length,
      totalRevenue: allOrders.filter(o => o.status !== "annulee").reduce((s, o) => s + (o.total || 0), 0),
      totalReservations: reservations.count || 0,
      todayOrders: todayOrders.length,
      todayRevenue: todayOrders.filter(o => o.status !== "annulee").reduce((s, o) => s + (o.total || 0), 0),
    });
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!isAdmin) return null;

  const filteredRestaurants = restaurants.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPrice = (v: number) => v.toLocaleString("fr-FR") + " FCFA";

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border bg-card px-4 md:px-6 h-14 flex items-center justify-between sticky top-0 z-40">
        <Link to="/" className="font-extrabold text-lg">
          Menu<span className="text-primary">Up</span>
          <Badge variant="destructive" className="ml-2 text-[10px]">Admin</Badge>
        </Link>
        <Button variant="ghost" size="sm" onClick={async () => { await signOut(); navigate("/"); }}>
          <LogOut className="h-4 w-4 mr-2" /> Déconnexion
        </Button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex w-56 border-r border-border bg-card flex-col p-4 min-h-[calc(100vh-3.5rem)]">
          <nav className="space-y-1">
            {[
              { id: "overview" as const, label: "Vue d'ensemble", icon: LayoutDashboard },
              { id: "restaurants" as const, label: "Restaurants", icon: Store },
              { id: "users" as const, label: "Utilisateurs", icon: Users },
            ].map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === item.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"
                }`}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile tabs */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border flex z-40">
          {[
            { id: "overview" as const, label: "Aperçu", icon: LayoutDashboard },
            { id: "restaurants" as const, label: "Restos", icon: Store },
            { id: "users" as const, label: "Users", icon: Users },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium ${
                activeTab === item.id ? "text-primary" : "text-muted-foreground"
              }`}>
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold">Vue d'ensemble</h1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Restaurants", value: stats.totalRestaurants, sub: `${stats.publishedRestaurants} publiés`, icon: Store },
                  { label: "Commandes", value: stats.totalOrders, sub: `${stats.todayOrders} aujourd'hui`, icon: BarChart3 },
                  { label: "CA Total", value: formatPrice(stats.totalRevenue), sub: `${formatPrice(stats.todayRevenue)} aujourd'hui`, icon: TrendingUp },
                  { label: "Réservations", value: stats.totalReservations, sub: "total", icon: Users },
                ].map(s => (
                  <Card key={s.label}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                        <s.icon className="h-3.5 w-3.5" />
                        {s.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xl md:text-2xl font-bold">{s.value}</p>
                      <p className="text-[11px] text-muted-foreground">{s.sub}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Recent restaurants */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Derniers restaurants inscrits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {restaurants.slice(0, 5).map(r => (
                    <div key={r.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex items-center gap-3">
                        {r.logo_url ? (
                          <img src={r.logo_url} className="w-8 h-8 rounded-full object-cover" alt="" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                            {r.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium">{r.name}</p>
                          <p className="text-[11px] text-muted-foreground">{r.cuisine_type || "—"} · /{r.slug}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={r.is_published ? "default" : "secondary"} className="text-[10px]">
                          {r.is_published ? "Publié" : "Brouillon"}
                        </Badge>
                        <Link to={`/restaurant/${r.slug}`}>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "restaurants" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Restaurants ({restaurants.length})</h1>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher un restaurant..." className="pl-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <div className="space-y-2">
                {filteredRestaurants.map(r => (
                  <Card key={r.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {r.logo_url ? (
                          <img src={r.logo_url} className="w-10 h-10 rounded-full object-cover" alt="" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {r.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold">{r.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {r.cuisine_type || "—"} · {r.phone || "—"} · /{r.slug}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Créé le {new Date(r.created_at).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={r.is_published ? "default" : "secondary"} className="text-[10px]">
                          {r.is_published ? "Publié" : "Brouillon"}
                        </Badge>
                        {r.delivery_enabled && <Badge variant="outline" className="text-[10px]">Livraison</Badge>}
                        {r.reservation_enabled && <Badge variant="outline" className="text-[10px]">Résa</Badge>}
                        <Link to={`/restaurant/${r.slug}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredRestaurants.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Aucun restaurant trouvé</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-4">
              <h1 className="text-2xl font-bold">Utilisateurs</h1>
              <p className="text-muted-foreground text-sm">
                Chaque restaurant correspond à un utilisateur inscrit.
              </p>
              <div className="space-y-2">
                {restaurants.map(r => (
                  <Card key={r.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{r.name}</p>
                        <p className="text-xs text-muted-foreground">ID: {r.user_id.slice(0, 8)}...</p>
                        <p className="text-[10px] text-muted-foreground">
                          Inscrit le {new Date(r.created_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <Badge variant={r.is_published ? "default" : "secondary"}>
                        {r.is_published ? "Actif" : "Inactif"}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
