import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { MapPin, Clock, MessageCircle, Star, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchRestaurantBySlug, fetchCategories, fetchDishes, fetchBusinessHours } from "@/lib/api";

const RestaurantPublic = () => {
  const { slug } = useParams();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [dishes, setDishes] = useState<any[]>([]);
  const [hours, setHours] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const actualSlug = slug || "demo";
        const r = await fetchRestaurantBySlug(actualSlug);
        if (!r) { setNotFound(true); setLoading(false); return; }
        setRestaurant(r);
        const [cats, dsh, hrs] = await Promise.all([
          fetchCategories(r.id),
          fetchDishes(r.id),
          fetchBusinessHours(r.id),
        ]);
        setCategories(cats);
        setDishes(dsh);
        setHours(hrs);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  if (notFound || !restaurant) return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Restaurant non trouvé 😕</h1>
        <p className="text-muted-foreground">Ce restaurant n'existe pas ou n'est plus en ligne.</p>
        <Link to="/"><Button className="gradient-primary text-primary-foreground rounded-xl">Retour à l'accueil</Button></Link>
      </div>
    </div>
  );

  // Check if open now
  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7; // Convert to Mon=0
  const todayHours = hours.find((h) => h.day_of_week === dayOfWeek);
  const isOpen = todayHours && !todayHours.is_closed;

  const filteredDishes = activeCategory === "all"
    ? dishes.filter((d) => d.is_available)
    : dishes.filter((d) => d.category_id === activeCategory && d.is_available);

  const toggleItem = (name: string) => {
    setSelectedItems((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const whatsappNumber = (restaurant.whatsapp || "").replace(/[^0-9]/g, "");
  const whatsappMessage = selectedItems.length > 0
    ? `Bonjour ${restaurant.name} ! Je souhaite commander :\n${selectedItems.map((item) => `- ${item}`).join("\n")}\nMerci !`
    : `Bonjour ${restaurant.name} ! Je souhaite passer une commande.`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  const openTime = todayHours?.open_time?.slice(0, 5) || "08:00";
  const closeTime = todayHours?.close_time?.slice(0, 5) || "22:00";

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-44" style={{ backgroundColor: restaurant.primary_color || "hsl(25, 95%, 53%)" }}>
        <div className="absolute top-4 left-4">
          <Link to="/" className="inline-flex items-center gap-1 text-white/80 text-sm">
            <ArrowLeft className="h-4 w-4" /> Retour
          </Link>
        </div>
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <div className="w-24 h-24 rounded-2xl bg-card border-4 border-background shadow-lg flex items-center justify-center text-3xl">
            {restaurant.logo_url ? (
              <img src={restaurant.logo_url} alt={restaurant.name} className="w-full h-full object-cover rounded-2xl" />
            ) : "🍽️"}
          </div>
        </div>
      </div>

      <div className="pt-16 px-4 text-center space-y-2 max-w-lg mx-auto">
        <h1 className="text-2xl font-extrabold">{restaurant.name}</h1>
        {restaurant.slogan && <p className="text-muted-foreground text-sm">{restaurant.slogan}</p>}
        <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
          {restaurant.cuisine_type && (
            <span className="bg-secondary px-2 py-1 rounded-full">{restaurant.cuisine_type}</span>
          )}
          <span className={`px-2 py-1 rounded-full font-medium ${isOpen ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"}`}>
            {isOpen ? "🟢 Ouvert" : "🔴 Fermé"}
          </span>
        </div>
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
          {restaurant.address && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {restaurant.address}</span>}
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {openTime}h - {closeTime}h</span>
        </div>
      </div>

      {categories.length > 0 && (
        <div className="mt-6 px-4 max-w-lg mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button onClick={() => setActiveCategory("all")}
              className={`text-sm px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                activeCategory === "all" ? "bg-primary text-primary-foreground font-medium" : "bg-secondary text-secondary-foreground"
              }`}>Tous</button>
            {categories.map((cat) => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                className={`text-sm px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  activeCategory === cat.id ? "bg-primary text-primary-foreground font-medium" : "bg-secondary text-secondary-foreground"
                }`}>{cat.name}</button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 px-4 pb-28 max-w-lg mx-auto space-y-3">
        {filteredDishes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Aucun plat disponible pour le moment.</p>
          </div>
        ) : (
          filteredDishes.map((item) => (
            <button key={item.id} onClick={() => toggleItem(item.name)}
              className={`w-full text-left rounded-2xl border-2 p-4 flex items-center gap-3 transition-all ${
                selectedItems.includes(item.name)
                  ? "border-primary bg-primary/5 shadow-warm"
                  : "border-border bg-card hover:border-primary/30"
              }`}>
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-2xl flex-shrink-0">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                ) : "🍽️"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm">{item.name}</h3>
                  {item.is_popular && <Star className="h-3.5 w-3.5 text-warning fill-warning" />}
                  {item.tags?.map((t: string) => <span key={t} className="text-xs">{t}</span>)}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                <p className="text-sm font-bold text-primary mt-1">{Number(item.price).toLocaleString()} FCFA</p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                selectedItems.includes(item.name) ? "border-primary bg-primary" : "border-border"
              }`}>
                {selectedItems.includes(item.name) && <span className="text-primary-foreground text-xs">✓</span>}
              </div>
            </button>
          ))
        )}
      </div>

      {whatsappNumber && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-border max-w-lg mx-auto">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block">
            <Button className="w-full py-6 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-[#fff] font-bold text-base shadow-lg">
              <MessageCircle className="h-5 w-5 mr-2" />
              {selectedItems.length > 0
                ? `Commander ${selectedItems.length} plat${selectedItems.length > 1 ? "s" : ""} sur WhatsApp`
                : "Commander sur WhatsApp"}
            </Button>
          </a>
        </div>
      )}

      <div className="text-center pb-4 pt-2 max-w-lg mx-auto">
        <p className="text-xs text-muted-foreground">
          Propulsé par <Link to="/" className="text-primary font-semibold">MenuUp</Link>
        </p>
      </div>
    </div>
  );
};

export default RestaurantPublic;
