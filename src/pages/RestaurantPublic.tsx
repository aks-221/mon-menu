import { useState, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { MapPin, Clock, Phone, MessageCircle, Star, ChevronRight, Loader2, Instagram, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchRestaurantBySlug, fetchCategories, fetchDishes, fetchBusinessHours } from "@/lib/api";

const DAY_NAMES = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

const RestaurantPublic = () => {
  const { slug } = useParams();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [dishes, setDishes] = useState<any[]>([]);
  const [hours, setHours] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedItems, setSelectedItems] = useState<{ name: string; price: number }[]>([]);
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

  // Dynamic branding color
  const brandColor = restaurant?.primary_color || "hsl(25, 95%, 53%)";

  // Check if open now
  const { isOpen, todayHours } = useMemo(() => {
    const now = new Date();
    const dayOfWeek = (now.getDay() + 6) % 7;
    const th = hours.find((h) => h.day_of_week === dayOfWeek);
    if (!th || th.is_closed) return { isOpen: false, todayHours: th };
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const open = th.open_time?.slice(0, 5) || "00:00";
    const close = th.close_time?.slice(0, 5) || "23:59";
    return { isOpen: currentTime >= open && currentTime <= close, todayHours: th };
  }, [hours]);

  const popularDishes = useMemo(() => dishes.filter(d => d.is_available && d.is_popular), [dishes]);

  const filteredDishes = useMemo(() => {
    const available = dishes.filter(d => d.is_available);
    return activeCategory === "all" ? available : available.filter(d => d.category_id === activeCategory);
  }, [dishes, activeCategory]);

  const toggleItem = (item: any) => {
    setSelectedItems((prev) => {
      const exists = prev.find(i => i.name === item.name);
      return exists ? prev.filter(i => i.name !== item.name) : [...prev, { name: item.name, price: item.price }];
    });
  };

  const isSelected = (name: string) => selectedItems.some(i => i.name === name);

  const totalPrice = selectedItems.reduce((sum, i) => sum + Number(i.price), 0);

  const whatsappNumber = (restaurant?.whatsapp || "").replace(/[^0-9]/g, "");
  const whatsappMessage = selectedItems.length > 0
    ? `Bonjour ${restaurant?.name} ! Je souhaite commander :\n${selectedItems.map(i => `- ${i.name} (${Number(i.price).toLocaleString()} FCFA)`).join("\n")}\n\nTotal : ${totalPrice.toLocaleString()} FCFA\nMerci !`
    : `Bonjour ${restaurant?.name} ! Je souhaite passer une commande.`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin" style={{ color: brandColor }} />
    </div>
  );

  if (notFound || !restaurant) return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Restaurant non trouvé 😕</h1>
        <p className="text-muted-foreground">Ce restaurant n'existe pas ou n'est plus en ligne.</p>
        <Link to="/"><Button className="rounded-xl">Retour à l'accueil</Button></Link>
      </div>
    </div>
  );

  const openTime = todayHours?.open_time?.slice(0, 5) || "08:00";
  const closeTime = todayHours?.close_time?.slice(0, 5) || "22:00";

  return (
    <div className="min-h-screen bg-background">
      {/* === HERO === */}
      <section className="relative">
        {/* Cover image */}
        <div className="w-full h-52 sm:h-64 relative overflow-hidden">
          {restaurant.cover_url ? (
            <img src={restaurant.cover_url} alt={restaurant.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${brandColor}, ${brandColor}dd)` }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </div>

        {/* Restaurant info overlay */}
        <div className="relative -mt-20 px-4 max-w-lg mx-auto">
          <div className="bg-card rounded-2xl shadow-xl p-5 border border-border">
            <div className="flex items-start gap-4">
              {/* Logo */}
              <div className="w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden shadow-md border-2 border-background"
                style={{ borderColor: brandColor }}>
                {restaurant.logo_url ? (
                  <img src={restaurant.logo_url} alt={restaurant.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl" style={{ backgroundColor: `${brandColor}20` }}>🍽️</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-extrabold leading-tight">{restaurant.name}</h1>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {restaurant.cuisine_type && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
                      {restaurant.cuisine_type}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                    {isOpen ? "🟢 Ouvert" : "🔴 Fermé"}
                  </span>
                </div>
                {restaurant.slogan && <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{restaurant.slogan}</p>}
              </div>
            </div>

            {/* Quick info */}
            <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground flex-wrap">
              {restaurant.address && (
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" style={{ color: brandColor }} /> {restaurant.address}</span>
              )}
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" style={{ color: brandColor }} /> {openTime}h – {closeTime}h</span>
            </div>

            {/* WhatsApp CTA */}
            {whatsappNumber && (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block mt-4">
                <Button className="w-full py-5 rounded-xl text-base font-bold shadow-lg" style={{ backgroundColor: "#25D366", color: "#fff" }}>
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Commander sur WhatsApp
                </Button>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* === POPULAR / SPECIALTIES === */}
      {popularDishes.length > 0 && (
        <section className="mt-6 px-4 max-w-lg mx-auto">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
            <Star className="h-5 w-5 fill-current" style={{ color: brandColor }} /> Nos spécialités
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
            {popularDishes.slice(0, 6).map((item) => (
              <button
                key={item.id}
                onClick={() => toggleItem(item)}
                className={`flex-shrink-0 w-36 rounded-xl border-2 overflow-hidden transition-all snap-start ${
                  isSelected(item.name) ? "shadow-lg scale-[1.02]" : "border-border bg-card hover:shadow-md"
                }`}
                style={isSelected(item.name) ? { borderColor: brandColor, boxShadow: `0 4px 20px ${brandColor}30` } : {}}
              >
                <div className="w-full h-24 bg-muted relative">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl" style={{ backgroundColor: `${brandColor}10` }}>🍽️</div>
                  )}
                  {isSelected(item.name) && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs" style={{ backgroundColor: brandColor }}>✓</div>
                  )}
                </div>
                <div className="p-2.5 text-left">
                  <p className="text-xs font-bold line-clamp-1">{item.name}</p>
                  <p className="text-xs font-bold mt-0.5" style={{ color: brandColor }}>{Number(item.price).toLocaleString()} FCFA</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* === MENU === */}
      <section className="mt-6 px-4 max-w-lg mx-auto">
        <h2 className="text-lg font-bold mb-3">📋 Notre Menu</h2>

        {/* Category tabs */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1">
            <button
              onClick={() => setActiveCategory("all")}
              className={`text-sm px-4 py-2 rounded-full whitespace-nowrap transition-all font-medium ${
                activeCategory === "all" ? "text-white shadow-md" : "bg-secondary text-secondary-foreground"
              }`}
              style={activeCategory === "all" ? { backgroundColor: brandColor } : {}}
            >
              Tous
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`text-sm px-4 py-2 rounded-full whitespace-nowrap transition-all font-medium ${
                  activeCategory === cat.id ? "text-white shadow-md" : "bg-secondary text-secondary-foreground"
                }`}
                style={activeCategory === cat.id ? { backgroundColor: brandColor } : {}}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Dish cards */}
        <div className="space-y-3 pb-4">
          {filteredDishes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-4xl mb-2">🍽️</p>
              <p>Aucun plat disponible pour le moment.</p>
            </div>
          ) : (
            filteredDishes.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleItem(item)}
                className={`w-full text-left rounded-2xl border-2 overflow-hidden flex transition-all ${
                  isSelected(item.name) ? "shadow-lg" : "border-border bg-card hover:shadow-md"
                }`}
                style={isSelected(item.name) ? { borderColor: brandColor, backgroundColor: `${brandColor}08` } : {}}
              >
                {/* Image */}
                <div className="w-28 h-28 flex-shrink-0 relative bg-muted">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl" style={{ backgroundColor: `${brandColor}10` }}>🍽️</div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-bold text-sm">{item.name}</h3>
                      {item.is_popular && <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />}
                      {item.tags?.map((t: string) => <span key={t} className="text-xs">{t}</span>)}
                    </div>
                    {item.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm font-extrabold" style={{ color: brandColor }}>{Number(item.price).toLocaleString()} FCFA</p>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        isSelected(item.name) ? "text-white" : "border-muted-foreground/30"
                      }`}
                      style={isSelected(item.name) ? { backgroundColor: brandColor, borderColor: brandColor } : {}}
                    >
                      {isSelected(item.name) && <span className="text-xs">✓</span>}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </section>

      {/* === HORAIRES & INFOS === */}
      <section className="px-4 max-w-lg mx-auto pb-4">
        <h2 className="text-lg font-bold mb-3">🕒 Horaires & Infos</h2>
        <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
          {/* Hours */}
          {hours.length > 0 && (
            <div className="space-y-1.5">
              {hours.map((h) => {
                const now = new Date();
                const currentDay = (now.getDay() + 6) % 7;
                const isToday = h.day_of_week === currentDay;
                return (
                  <div key={h.day_of_week} className={`flex justify-between text-sm py-1 px-2 rounded-lg ${isToday ? "font-bold" : "text-muted-foreground"}`}
                    style={isToday ? { backgroundColor: `${brandColor}10`, color: brandColor } : {}}>
                    <span>{DAY_NAMES[h.day_of_week]}</span>
                    <span>{h.is_closed ? "Fermé" : `${h.open_time?.slice(0, 5)}h – ${h.close_time?.slice(0, 5)}h`}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Contact & address */}
          <div className="border-t border-border pt-3 space-y-2">
            {restaurant.address && (
              <a href={`https://maps.google.com/?q=${encodeURIComponent(restaurant.address)}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <MapPin className="h-4 w-4 flex-shrink-0" style={{ color: brandColor }} />
                <span className="underline">{restaurant.address}</span>
                <ChevronRight className="h-4 w-4 ml-auto flex-shrink-0" />
              </a>
            )}
            {restaurant.phone && (
              <a href={`tel:${restaurant.phone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Phone className="h-4 w-4 flex-shrink-0" style={{ color: brandColor }} />
                <span>{restaurant.phone}</span>
              </a>
            )}
            {(restaurant.social_instagram || restaurant.social_facebook) && (
              <div className="flex items-center gap-3 pt-1">
                {restaurant.social_instagram && (
                  <a href={restaurant.social_instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {restaurant.social_facebook && (
                  <a href={restaurant.social_facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* === FOOTER === */}
      <div className="text-center pb-32 pt-2 max-w-lg mx-auto">
        <p className="text-xs text-muted-foreground">
          Propulsé par <Link to="/" className="font-semibold" style={{ color: brandColor }}>MenuUp</Link>
        </p>
      </div>

      {/* === STICKY WHATSAPP BAR === */}
      {whatsappNumber && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <div className="max-w-lg mx-auto p-3 bg-background/90 backdrop-blur-xl border-t border-border">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block">
              <Button className="w-full py-6 rounded-xl font-bold text-base shadow-xl text-white"
                style={{ backgroundColor: "#25D366" }}>
                <MessageCircle className="h-5 w-5 mr-2" />
                {selectedItems.length > 0
                  ? `Commander ${selectedItems.length} plat${selectedItems.length > 1 ? "s" : ""} · ${totalPrice.toLocaleString()} FCFA`
                  : "Commander sur WhatsApp"}
              </Button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantPublic;
