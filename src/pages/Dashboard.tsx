import { useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard, UtensilsCrossed, Clock, Settings, BarChart3,
  QrCode, LogOut, Menu, X, Store, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardHome from "@/components/dashboard/DashboardHome";
import MenuManager from "@/components/dashboard/MenuManager";
import RestaurantProfile from "@/components/dashboard/RestaurantProfile";
import HoursManager from "@/components/dashboard/HoursManager";
import StatsView from "@/components/dashboard/StatsView";
import QrCodeView from "@/components/dashboard/QrCodeView";

const navItems = [
  { id: "home", label: "Aperçu", icon: LayoutDashboard },
  { id: "profile", label: "Profil", icon: Store },
  { id: "menu", label: "Menu", icon: UtensilsCrossed },
  { id: "hours", label: "Horaires", icon: Clock },
  { id: "stats", label: "Statistiques", icon: BarChart3 },
  { id: "qrcode", label: "QR Code", icon: QrCode },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case "home": return <DashboardHome onNavigate={setActiveTab} />;
      case "profile": return <RestaurantProfile />;
      case "menu": return <MenuManager />;
      case "hours": return <HoursManager />;
      case "stats": return <StatsView />;
      case "qrcode": return <QrCodeView />;
      default: return <DashboardHome onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 h-14 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(true)}>
          <Menu className="h-6 w-6" />
        </button>
        <span className="font-extrabold">Menu<span className="text-primary">Up</span></span>
        <Link to="/restaurant/chez-fatou">
          <Eye className="h-5 w-5 text-muted-foreground" />
        </Link>
      </div>

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-foreground/50" onClick={() => setSidebarOpen(false)}>
          <div className="w-64 h-full bg-card p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <span className="font-extrabold text-lg">Menu<span className="text-primary">Up</span></span>
              <button onClick={() => setSidebarOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <SidebarNav items={navItems} active={activeTab} onSelect={(id) => { setActiveTab(id); setSidebarOpen(false); }} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 border-r border-border bg-card flex-col p-4">
        <div className="mb-8">
          <Link to="/" className="font-extrabold text-lg">Menu<span className="text-primary">Up</span></Link>
          <p className="text-xs text-muted-foreground mt-1">Chez Fatou</p>
        </div>
        <SidebarNav items={navItems} active={activeTab} onSelect={setActiveTab} />
        <div className="mt-auto space-y-2">
          <Link to="/restaurant/chez-fatou">
            <Button variant="outline" size="sm" className="w-full justify-start gap-2">
              <Eye className="h-4 w-4" /> Voir ma page
            </Button>
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground">
              <LogOut className="h-4 w-4" /> Déconnexion
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:p-6 p-4 pt-18 md:pt-6 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
};

const SidebarNav = ({ items, active, onSelect }: {
  items: typeof navItems; active: string; onSelect: (id: string) => void;
}) => (
  <nav className="space-y-1 flex-1">
    {items.map((item) => (
      <button
        key={item.id}
        onClick={() => onSelect(item.id)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
          active === item.id
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        }`}
      >
        <item.icon className="h-4 w-4" />
        {item.label}
      </button>
    ))}
  </nav>
);

export default Dashboard;
