import { useState, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { MapPin, Clock, Phone, MessageCircle, Star, ChevronRight, Loader2, Instagram, Facebook, ShoppingBag } from "lucide-react";
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
  const [selectedItems, setSelectedItems] = useState<{ id: string; name: string; price: number; qty: number }[]>([]);
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

  const brand = restaurant?.primary_color || "#E67E22";

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
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.filter(i => i.id !== item.id);
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setSelectedItems(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  };

  const isSelected = (id: string) => selectedItems.some(i => i.id === id);
  const getQty = (id: string) => selectedItems.find(i => i.id === id)?.qty || 0;

  const totalPrice = selectedItems.reduce((sum, i) => sum + Number(i.price) * i.qty, 0);
  const totalItems = selectedItems.reduce((sum, i) => sum + i.qty, 0);

  const whatsappNumber = (restaurant?.whatsapp || "").replace(/[^0-9]/g, "");
  const whatsappMessage = selectedItems.length > 0
    ? `Bonjour ${restaurant?.name} ! Je souhaite commander :\n${selectedItems.map(i => `- ${i.name} x${i.qty} (${(Number(i.price) * i.qty).toLocaleString()} FCFA)`).join("\n")}\n\nTotal : ${totalPrice.toLocaleString()} FCFA\nMerci !`
    : `Bonjour ${restaurant?.name} ! Je souhaite passer une commande.`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin" style={{ color: brand }} />
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
    <div className="min-h-screen bg-neutral-50">
      {/* ═══════ HERO ═══════ */}
      <section className="relative">
        <div className="w-full h-60 sm:h-72 relative overflow-hidden">
          {restaurant.cover_url ? (
            <img src={restaurant.cover_url} alt={restaurant.name} className="w-full h-full object-cover" loading="eager" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

          {/* Info overlay on hero */}
          <div className="absolute bottom-0 left-0 right-0 p-5 max-w-lg mx-auto">
            <div className="flex items-end gap-4">
              {/* Logo */}
              <div className="w-18 h-18 rounded-2xl flex-shrink-0 overflow-hidden shadow-2xl border-[3px] border-white/90 bg-white"
                style={{ width: 72, height: 72 }}>
                {restaurant.logo_url ? (
                  <img src={restaurant.logo_url} alt={restaurant.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl bg-neutral-100">🍽️</div>
                )}
              </div>
              <div className="flex-1 min-w-0 pb-0.5">
                <h1 className="text-2xl font-extrabold text-white leading-tight drop-shadow-lg">{restaurant.name}</h1>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {restaurant.cuisine_type && (
                    <span className="text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full font-semibold bg-white/20 text-white backdrop-blur-sm">
                      {restaurant.cuisine_type}
                    </span>
                  )}
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold backdrop-blur-sm ${
                    isOpen ? "bg-emerald-500/90 text-white" : "bg-red-500/90 text-white"
                  }`}>
                    {isOpen ? "● Ouvert" : "● Fermé"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick info bar */}
        <div className="max-w-lg mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg -mt-4 relative z-10 p-4 border border-neutral-100">
            {restaurant.slogan && (
              <p className="text-sm text-neutral-500 mb-3 italic">"{restaurant.slogan}"</p>
            )}
            <div className="flex items-center gap-4 text-xs text-neutral-500 flex-wrap">
              {restaurant.address && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" style={{ color: brand }} /> {restaurant.address}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" style={{ color: brand }} /> {openTime} – {closeTime}
              </span>
            </div>

            {/* Primary CTA */}
            {whatsappNumber && (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block mt-4">
                <button
                  className="w-full py-3.5 rounded-xl text-[15px] font-bold shadow-lg flex items-center justify-center gap-2 text-white transition-all active:scale-[0.98]"
                  style={{ backgroundColor: brand, boxShadow: `0 8px 24px -4px ${brand}50` }}
                >
                  <MessageCircle className="h-5 w-5" />
                  Commander sur WhatsApp
                </button>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ═══════ POPULAR DISHES ═══════ */}
      {popularDishes.length > 0 && (
        <section className="mt-8 max-w-lg mx-auto">
          <div className="px-4 flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 fill-current" style={{ color: brand }} />
            <h2 className="text-lg font-bold text-neutral-900">Nos spécialités</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-3 px-4 snap-x scrollbar-hide">
            {popularDishes.slice(0, 8).map((item) => {
              const selected = isSelected(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item)}
                  className={`flex-shrink-0 w-40 rounded-2xl overflow-hidden transition-all duration-200 snap-start bg-white border-2 ${
                    selected ? "scale-[1.03] shadow-xl" : "shadow-md hover:shadow-lg border-transparent hover:scale-[1.02]"
                  }`}
                  style={selected ? { borderColor: brand } : {}}
                >
                  <div className="w-full h-28 bg-neutral-100 relative overflow-hidden">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl bg-neutral-50">🍽️</div>
                    )}
                    {selected && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
                        style={{ backgroundColor: brand }}>
                        ✓
                      </div>
                    )}
                    {item.is_popular && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-amber-900">
                        ⭐ Populaire
                      </div>
                    )}
                  </div>
                  <div className="p-3 text-left">
                    <p className="text-sm font-bold text-neutral-900 line-clamp-1">{item.name}</p>
                    <p className="text-sm font-extrabold mt-1" style={{ color: brand }}>{Number(item.price).toLocaleString()} FCFA</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ═══════ FULL MENU ═══════ */}
      <section className="mt-8 max-w-lg mx-auto px-4">
        <h2 className="text-lg font-bold text-neutral-900 mb-4">📋 Notre Menu</h2>

        {/* Category tabs */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-1 px-1">
            <button
              onClick={() => setActiveCategory("all")}
              className={`text-sm px-5 py-2.5 rounded-full whitespace-nowrap transition-all font-semibold ${
                activeCategory === "all" ? "text-white shadow-lg" : "bg-white text-neutral-600 shadow-sm border border-neutral-200"
              }`}
              style={activeCategory === "all" ? { backgroundColor: brand, boxShadow: `0 4px 12px ${brand}40` } : {}}
            >
              Tous
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`text-sm px-5 py-2.5 rounded-full whitespace-nowrap transition-all font-semibold ${
                  activeCategory === cat.id ? "text-white shadow-lg" : "bg-white text-neutral-600 shadow-sm border border-neutral-200"
                }`}
                style={activeCategory === cat.id ? { backgroundColor: brand, boxShadow: `0 4px 12px ${brand}40` } : {}}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Dish cards */}
        <div className="space-y-3 pb-4">
          {filteredDishes.length === 0 ? (
            <div className="text-center py-16 text-neutral-400">
              <p className="text-5xl mb-3">🍽️</p>
              <p className="font-medium">Aucun plat disponible pour le moment.</p>
            </div>
          ) : (
            filteredDishes.map((item) => {
              const selected = isSelected(item.id);
              const qty = getQty(item.id);
              return (
                <div
                  key={item.id}
                  className={`rounded-2xl overflow-hidden bg-white transition-all duration-200 border-2 ${
                    selected ? "shadow-xl" : "shadow-sm hover:shadow-md border-transparent"
                  }`}
                  style={selected ? { borderColor: brand } : {}}
                >
                  <div className="flex">
                    {/* Image */}
                    <div className="w-28 h-32 flex-shrink-0 relative bg-neutral-100 overflow-hidden">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl bg-neutral-50">🍽️</div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-3.5 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-[15px] text-neutral-900 leading-snug">{item.name}</h3>
                          <div className="flex gap-1 flex-shrink-0">
                            {item.is_popular && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold">⭐</span>}
                            {item.tags?.map((t: string) => <span key={t} className="text-[10px]">{t}</span>)}
                          </div>
                        </div>
                        {item.description && <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>}
                      </div>

                      <div className="flex items-center justify-between mt-2.5">
                        <p className="text-base font-extrabold" style={{ color: brand }}>{Number(item.price).toLocaleString()} FCFA</p>

                        {selected ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); if (qty <= 1) toggleItem(item); else updateQty(item.id, -1); }}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors"
                              style={{ borderColor: brand, color: brand }}
                            >−</button>
                            <span className="text-sm font-bold w-4 text-center">{qty}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); updateQty(item.id, 1); }}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white transition-colors"
                              style={{ backgroundColor: brand }}
                            >+</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => toggleItem(item)}
                            className="px-3 py-1.5 rounded-full text-xs font-bold text-white transition-all active:scale-95"
                            style={{ backgroundColor: brand }}
                          >
                            + Ajouter
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* ═══════ HOURS & INFO ═══════ */}
      <section className="px-4 max-w-lg mx-auto pb-4 mt-4">
        <h2 className="text-lg font-bold text-neutral-900 mb-4">🕒 Horaires & Infos</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5 space-y-5">
          {hours.length > 0 && (
            <div className="space-y-1">
              {hours.map((h) => {
                const now = new Date();
                const currentDay = (now.getDay() + 6) % 7;
                const isToday = h.day_of_week === currentDay;
                return (
                  <div key={h.day_of_week}
                    className={`flex justify-between text-sm py-2 px-3 rounded-xl transition-colors ${
                      isToday ? "font-bold" : "text-neutral-500"
                    }`}
                    style={isToday ? { backgroundColor: `${brand}12`, color: brand } : {}}
                  >
                    <span>{DAY_NAMES[h.day_of_week]}</span>
                    <span>{h.is_closed ? "Fermé" : `${h.open_time?.slice(0, 5)} – ${h.close_time?.slice(0, 5)}`}</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="border-t border-neutral-100 pt-4 space-y-3">
            {restaurant.address && (
              <a href={`https://maps.google.com/?q=${encodeURIComponent(restaurant.address)}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-neutral-600 hover:text-neutral-900 transition-colors group">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${brand}15` }}>
                  <MapPin className="h-4 w-4" style={{ color: brand }} />
                </div>
                <span className="group-hover:underline flex-1">{restaurant.address}</span>
                <ChevronRight className="h-4 w-4 text-neutral-300 flex-shrink-0" />
              </a>
            )}
            {restaurant.phone && (
              <a href={`tel:${restaurant.phone}`} className="flex items-center gap-3 text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${brand}15` }}>
                  <Phone className="h-4 w-4" style={{ color: brand }} />
                </div>
                <span>{restaurant.phone}</span>
              </a>
            )}
            {(restaurant.social_instagram || restaurant.social_facebook) && (
              <div className="flex items-center gap-3 pt-1">
                {restaurant.social_instagram && (
                  <a href={restaurant.social_instagram} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-colors"
                    style={{ backgroundColor: `${brand}10` }}>
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {restaurant.social_facebook && (
                  <a href={restaurant.social_facebook} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-colors"
                    style={{ backgroundColor: `${brand}10` }}>
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <div className="text-center pb-36 pt-4 max-w-lg mx-auto">
        <p className="text-xs text-neutral-400">
          Propulsé par <Link to="/" className="font-semibold hover:underline" style={{ color: brand }}>MenuUp</Link>
        </p>
      </div>

      {/* ═══════ STICKY WHATSAPP BAR ═══════ */}
      {whatsappNumber && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <div className="max-w-lg mx-auto p-3">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block">
              <button
                className="w-full py-4 rounded-2xl font-bold text-[15px] shadow-2xl text-white flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
                style={{ backgroundColor: brand, boxShadow: `0 8px 32px -4px ${brand}60` }}
              >
                {selectedItems.length > 0 ? (
                  <>
                    <ShoppingBag className="h-5 w-5" />
                    Commander {totalItems} article{totalItems > 1 ? "s" : ""} · {totalPrice.toLocaleString()} FCFA
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-5 w-5" />
                    Commander sur WhatsApp
                  </>
                )}
              </button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantPublic;
