import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, UtensilsCrossed, Clock, BarChart3,
  QrCode, LogOut, Menu, X, Store, Eye, Loader2, Package, Truck, CalendarDays
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { fetchUserRestaurant } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import DashboardHome from "@/components/dashboard/DashboardHome";
import MenuManager from "@/components/dashboard/MenuManager";
import RestaurantProfile from "@/components/dashboard/RestaurantProfile";
import HoursManager from "@/components/dashboard/HoursManager";
import StatsView from "@/components/dashboard/StatsView";
import QrCodeView from "@/components/dashboard/QrCodeView";
import OrdersManager from "@/components/dashboard/OrdersManager";
import DeliveryZonesManager from "@/components/dashboard/DeliveryZonesManager";
import ReservationsManager from "@/components/dashboard/ReservationsManager";
import TrialBanner from "@/components/dashboard/TrialBanner";
import PaywallPage from "@/components/dashboard/PaywallPage";
import SubscribeModal from "@/components/dashboard/SubscribeModal";
import { useSubscription } from "@/hooks/useSubscription";

const navItems = [
  { id: "home", label: "Aperçu", icon: LayoutDashboard },
  { id: "orders", label: "Commandes", icon: Package },
  { id: "menu", label: "Menu", icon: UtensilsCrossed },
  { id: "delivery", label: "Livraison", icon: Truck },
  { id: "reservations", label: "Réservations", icon: CalendarDays },
  { id: "stats", label: "Statistiques", icon: BarChart3 },
  { id: "profile", label: "Profil", icon: Store },
  { id: "hours", label: "Horaires", icon: Clock },
  { id: "qrcode", label: "QR Code", icon: QrCode },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orderCount, setOrderCount] = useState(0);
  const [reservationCount, setReservationCount] = useState(0);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const { user, signOut, loading: authLoading } = useAuth();
  const { trialDaysLeft, isTrialActive, isSubscribed, hasAccess, loading: subLoading } = useSubscription(restaurant);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }
    if (user) {
      fetchUserRestaurant(user.id).then((r) => {
        setRestaurant(r);
        setLoading(false);
        if (r) {
          // Fetch counts
          supabase.from("orders").select("id", { count: "exact", head: true })
            .eq("restaurant_id", r.id).eq("status", "en_attente")
            .then(({ count }) => setOrderCount(count || 0));
          supabase.from("reservations").select("id", { count: "exact", head: true })
            .eq("restaurant_id", r.id).eq("status", "en_attente")
            .then(({ count }) => setReservationCount(count || 0));

          // Realtime subscriptions for counts
          const ordersChannel = supabase.channel("orders-count")
            .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `restaurant_id=eq.${r.id}` }, () => {
              supabase.from("orders").select("id", { count: "exact", head: true })
                .eq("restaurant_id", r.id).eq("status", "en_attente")
                .then(({ count }) => setOrderCount(count || 0));
            }).subscribe();

          const reservationsChannel = supabase.channel("reservations-count")
            .on("postgres_changes", { event: "*", schema: "public", table: "reservations", filter: `restaurant_id=eq.${r.id}` }, () => {
              supabase.from("reservations").select("id", { count: "exact", head: true })
                .eq("restaurant_id", r.id).eq("status", "en_attente")
                .then(({ count }) => setReservationCount(count || 0));
            }).subscribe();

          return () => {
            supabase.removeChannel(ordersChannel);
            supabase.removeChannel(reservationsChannel);
          };
        }
      }).catch(() => setLoading(false));
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || loading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Aucun restaurant trouvé</h1>
          <p className="text-muted-foreground">Créez votre premier restaurant pour commencer.</p>
          <Link to="/register">
            <Button className="gradient-primary text-primary-foreground rounded-xl">Créer un restaurant</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <>
        <PaywallPage onSubscribe={() => setShowSubscribeModal(true)} />
        <SubscribeModal
          open={showSubscribeModal}
          onOpenChange={setShowSubscribeModal}
          restaurant={restaurant}
          onSuccess={() => window.location.reload()}
        />
      </>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "home": return <DashboardHome restaurant={restaurant} onNavigate={setActiveTab} />;
      case "orders": return <OrdersManager restaurant={restaurant} />;
      case "menu": return <MenuManager restaurant={restaurant} />;
      case "delivery": return <DeliveryZonesManager restaurant={restaurant} onUpdate={setRestaurant} />;
      case "reservations": return <ReservationsManager restaurant={restaurant} />;
      case "stats": return <StatsView restaurant={restaurant} />;
      case "profile": return <RestaurantProfile restaurant={restaurant} onUpdate={setRestaurant} />;
      case "hours": return <HoursManager restaurant={restaurant} />;
      case "qrcode": return <QrCodeView restaurant={restaurant} />;
      default: return <DashboardHome restaurant={restaurant} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 h-14 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(true)}><Menu className="h-6 w-6" /></button>
        <span className="font-extrabold">Menu<span className="text-primary">Up</span></span>
        <Link to={`/restaurant/${restaurant.slug}`}><Eye className="h-5 w-5 text-muted-foreground" /></Link>
      </div>

      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-foreground/50" onClick={() => setSidebarOpen(false)}>
          <div className="w-64 h-full bg-card p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <span className="font-extrabold text-lg">Menu<span className="text-primary">Up</span></span>
              <button onClick={() => setSidebarOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <SidebarNav items={navItems} active={activeTab} onSelect={(id) => { setActiveTab(id); setSidebarOpen(false); }} badges={{ orders: orderCount, reservations: reservationCount }} />
          </div>
        </div>
      )}

      <aside className="hidden md:flex w-64 border-r border-border bg-card flex-col p-4">
        <div className="mb-8">
          <Link to="/" className="font-extrabold text-lg">Menu<span className="text-primary">Up</span></Link>
          <p className="text-xs text-muted-foreground mt-1">{restaurant.name}</p>
        </div>
        <SidebarNav items={navItems} active={activeTab} onSelect={setActiveTab} badges={{ orders: orderCount, reservations: reservationCount }} />
        <div className="mt-auto space-y-2">
          <Link to={`/restaurant/${restaurant.slug}`}>
            <Button variant="outline" size="sm" className="w-full justify-start gap-2"><Eye className="h-4 w-4" /> Voir ma page</Button>
          </Link>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" /> Déconnexion
          </Button>
        </div>
      </aside>

      <main className="flex-1 md:p-6 p-4 pt-18 md:pt-6 overflow-auto">{renderContent()}</main>
    </div>
  );
};

const SidebarNav = ({ items, active, onSelect, badges }: {
  items: typeof navItems; active: string; onSelect: (id: string) => void;
  badges: Record<string, number>;
}) => (
  <nav className="space-y-1 flex-1">
    {items.map((item) => {
      const count = badges[item.id] || 0;
      return (
        <button key={item.id} onClick={() => onSelect(item.id)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            active === item.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}>
          <item.icon className="h-4 w-4" />
          <span className="flex-1 text-left">{item.label}</span>
          {count > 0 && (
            <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center">
              {count}
            </span>
          )}
        </button>
      );
    })}
  </nav>
);

export default Dashboard;
