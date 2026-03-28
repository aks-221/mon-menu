import { useState, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { MapPin, Clock, Phone, MessageCircle, Star, ChevronRight, Loader2, Instagram, Facebook, ShoppingBag, Plus, Minus } from "lucide-react";
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

  const brand = restaurant?.primary_color || "#F59E0B";

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

  const filteredDishes = useMemo(() => {
    const available = dishes.filter(d => d.is_available);
    return activeCategory === "all" ? available : available.filter(d => d.category_id === activeCategory);
  }, [dishes, activeCategory]);

  const toggleItem = (item: any) => {
    setSelectedItems((prev) => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) return prev.filter(i => i.id !== item.id);
      return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setSelectedItems(prev => {
      return prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i);
    });
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
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFAFA" }}>
      <Loader2 className="h-8 w-8 animate-spin" style={{ color: brand }} />
    </div>
  );

  if (notFound || !restaurant) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#FAFAFA" }}>
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Restaurant non trouvé 😕</h1>
        <p className="text-gray-500">Ce restaurant n'existe pas ou n'est plus en ligne.</p>
        <Link to="/">
          <button className="px-6 py-3 rounded-xl font-semibold text-white" style={{ backgroundColor: brand }}>Retour à l'accueil</button>
        </Link>
      </div>
    </div>
  );

  const openTime = todayHours?.open_time?.slice(0, 5) || "08:00";
  const closeTime = todayHours?.close_time?.slice(0, 5) || "22:00";

  // Lighter brand for backgrounds
  const brandLight = `${brand}18`;
  const brandMedium = `${brand}30`;

  return (
    <div className="min-h-screen" style={{ background: "#F5F5F0" }}>

      {/* ═══════════════════════════════════════════
          HERO — Cover + Restaurant Card
      ═══════════════════════════════════════════ */}
      <section className="relative">
        {/* Cover photo */}
        <div className="w-full h-56 sm:h-64 overflow-hidden">
          {restaurant.cover_url ? (
            <img src={restaurant.cover_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>

        {/* Restaurant info card — overlapping cover */}
        <div className="relative -mt-28 px-4 max-w-md mx-auto z-10">
          <div className="bg-white rounded-3xl shadow-xl p-5" style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.10)" }}>
            <div className="flex items-start gap-4">
              {/* Logo */}
              <div
                className="w-20 h-20 rounded-2xl flex-shrink-0 overflow-hidden border-[3px]"
                style={{ borderColor: brand }}
              >
                {restaurant.logo_url ? (
                  <img src={restaurant.logo_url} alt={restaurant.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl" style={{ backgroundColor: brandLight }}>🍽️</div>
                )}
              </div>

              <div className="flex-1 min-w-0 pt-1">
                <h1 className="text-xl font-extrabold text-gray-900 leading-tight">{restaurant.name}</h1>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {restaurant.cuisine_type && (
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"
                      style={{ backgroundColor: brandLight, color: brand }}
                    >
                      🍔 {restaurant.cuisine_type}
                    </span>
                  )}
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                    isOpen ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
                  }`}>
                    {isOpen ? "✓ Ouvert" : "✕ Fermé"}
                  </span>
                </div>
              </div>
            </div>

            {/* Slogan */}
            {restaurant.slogan && (
              <p className="text-sm text-gray-400 mt-3 italic">{restaurant.slogan}</p>
            )}

            {/* Address */}
            {restaurant.address && (
              <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                <MapPin className="h-4 w-4 flex-shrink-0" style={{ color: brand }} />
                <span>{restaurant.address}</span>
              </div>
            )}

            {/* WhatsApp CTA — prominent */}
            {whatsappNumber && (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block mt-4">
                <button
                  className="w-full py-4 rounded-2xl text-base font-bold text-white flex items-center justify-center gap-2 transition-transform active:scale-[0.97]"
                  style={{
                    backgroundColor: brand,
                    boxShadow: `0 6px 20px ${brandMedium}`,
                  }}
                >
                  <MessageCircle className="h-5 w-5" />
                  Commander sur WhatsApp
                </button>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          MENU
      ═══════════════════════════════════════════ */}
      <section className="mt-8 max-w-md mx-auto px-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
          📋 Menu
        </h2>

        {/* Category pills */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-4 -mx-1 px-1 scrollbar-hide">
            <button
              onClick={() => setActiveCategory("all")}
              className="text-sm px-5 py-2.5 rounded-full whitespace-nowrap font-semibold transition-all"
              style={
                activeCategory === "all"
                  ? { backgroundColor: brand, color: "#fff", boxShadow: `0 4px 14px ${brandMedium}` }
                  : { backgroundColor: "#fff", color: "#666", border: "1px solid #E5E5E5" }
              }
            >
              Tous
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="text-sm px-5 py-2.5 rounded-full whitespace-nowrap font-semibold transition-all"
                style={
                  activeCategory === cat.id
                    ? { backgroundColor: brand, color: "#fff", boxShadow: `0 4px 14px ${brandMedium}` }
                    : { backgroundColor: "#fff", color: "#666", border: "1px solid #E5E5E5" }
                }
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Dish list */}
        <div className="space-y-3 pb-4">
          {filteredDishes.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-5xl mb-3">🍽️</p>
              <p className="font-medium">Aucun plat disponible.</p>
            </div>
          ) : (
            filteredDishes.map((item) => {
              const selected = isSelected(item.id);
              const qty = getQty(item.id);
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl overflow-hidden flex transition-all duration-200"
                  style={{
                    border: selected ? `2px solid ${brand}` : "2px solid transparent",
                    boxShadow: selected ? `0 4px 20px ${brandMedium}` : "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                >
                  {/* Image */}
                  <div className="w-28 h-auto flex-shrink-0 relative overflow-hidden bg-gray-100">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover min-h-[112px]" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl min-h-[112px]" style={{ backgroundColor: brandLight }}>🍽️</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 p-3.5 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-[15px] text-gray-900 leading-snug">{item.name}</h3>
                        {item.is_popular && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: brandLight, color: brand }}>
                            Popular
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <p className="font-extrabold text-base text-gray-900">
                        {Number(item.price).toLocaleString()}{" "}
                        <span className="text-xs font-semibold" style={{ color: brand }}>FCFA</span>
                      </p>

                      {selected ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); if (qty <= 1) toggleItem(item); else updateQty(item.id, -1); }}
                            className="w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors"
                            style={{ borderColor: brand, color: brand }}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="text-sm font-bold w-5 text-center text-gray-900">{qty}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); updateQty(item.id, 1); }}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors"
                            style={{ backgroundColor: brand }}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => toggleItem(item)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-all active:scale-90"
                          style={{ backgroundColor: brand }}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          HOURS & INFO
      ═══════════════════════════════════════════ */}
      <section className="px-4 max-w-md mx-auto pb-4 mt-4">
        <h2 className="text-lg font-bold text-gray-900 mb-4">🕒 Horaires & Infos</h2>
        <div className="bg-white rounded-2xl p-5 space-y-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          {hours.length > 0 && (
            <div className="space-y-1">
              {hours.map((h) => {
                const now = new Date();
                const currentDay = (now.getDay() + 6) % 7;
                const isToday = h.day_of_week === currentDay;
                return (
                  <div
                    key={h.day_of_week}
                    className={`flex justify-between text-sm py-2 px-3 rounded-xl ${isToday ? "font-bold" : "text-gray-400"}`}
                    style={isToday ? { backgroundColor: brandLight, color: brand } : {}}
                  >
                    <span>{DAY_NAMES[h.day_of_week]}</span>
                    <span>{h.is_closed ? "Fermé" : `${h.open_time?.slice(0, 5)} – ${h.close_time?.slice(0, 5)}`}</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="border-t border-gray-100 pt-4 space-y-3">
            {restaurant.address && (
              <a href={`https://maps.google.com/?q=${encodeURIComponent(restaurant.address)}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-gray-500 hover:text-gray-800 transition-colors group">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: brandLight }}>
                  <MapPin className="h-4 w-4" style={{ color: brand }} />
                </div>
                <span className="group-hover:underline flex-1">{restaurant.address}</span>
                <ChevronRight className="h-4 w-4 text-gray-300" />
              </a>
            )}
            {restaurant.phone && (
              <a href={`tel:${restaurant.phone}`} className="flex items-center gap-3 text-sm text-gray-500 hover:text-gray-800 transition-colors">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: brandLight }}>
                  <Phone className="h-4 w-4" style={{ color: brand }} />
                </div>
                <span>{restaurant.phone}</span>
              </a>
            )}
            {(restaurant.social_instagram || restaurant.social_facebook) && (
              <div className="flex items-center gap-2 pt-1">
                {restaurant.social_instagram && (
                  <a href={restaurant.social_instagram} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
                    style={{ backgroundColor: brandLight }}>
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {restaurant.social_facebook && (
                  <a href={restaurant.social_facebook} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
                    style={{ backgroundColor: brandLight }}>
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="text-center pb-36 pt-6 max-w-md mx-auto">
        <p className="text-xs text-gray-400">
          Propulsé par <Link to="/" className="font-semibold hover:underline" style={{ color: brand }}>MenuUp</Link>
        </p>
      </div>

      {/* ═══════════════════════════════════════════
          STICKY WHATSAPP BAR
      ═══════════════════════════════════════════ */}
      {whatsappNumber && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-gray-200">
          <div className="max-w-md mx-auto p-3">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <button
                className="w-full py-4 rounded-2xl font-bold text-[15px] text-white flex items-center justify-center gap-2 transition-transform active:scale-[0.97]"
                style={{
                  backgroundColor: brand,
                  boxShadow: `0 6px 24px ${brandMedium}`,
                }}
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
