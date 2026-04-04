import { useState, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  MapPin, Clock, Phone, MessageCircle, Star, Loader2,
  Instagram, Facebook, ShoppingBag, Plus, Minus, ChefHat,
  Heart, Award, Mail, ChevronDown, Menu as MenuIcon, X,
  UtensilsCrossed, MapPinned, CalendarClock, MessageSquare, PhoneCall,
  CalendarDays
} from "lucide-react";
import { fetchRestaurantBySlug, fetchCategories, fetchDishes, fetchBusinessHours } from "@/lib/api";
import CheckoutModal from "@/components/checkout/CheckoutModal";
import ReservationModal from "@/components/checkout/ReservationModal";

const DAY_NAMES = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

const NAV_SECTIONS = [
  { id: "accueil", label: "Accueil" },
  { id: "menu", label: "Menu" },
  { id: "about", label: "À Propos" },
  { id: "location", label: "Emplacement" },
  { id: "hours", label: "Horaires" },
  { id: "contact", label: "Contact" },
];

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showReservation, setShowReservation] = useState(false);
  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetchRestaurantBySlug(slug || "demo");
        if (!r) { setNotFound(true); setLoading(false); return; }
        setRestaurant(r);
        const [cats, dsh, hrs] = await Promise.all([
          fetchCategories(r.id), fetchDishes(r.id), fetchBusinessHours(r.id),
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

  const brand = restaurant?.primary_color || "#16a34a";

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

  const popularDishes = useMemo(() => dishes.filter(d => d.is_popular && d.is_available), [dishes]);

  const toggleItem = (item: any) => {
    setSelectedItems((prev) => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) return prev.filter(i => i.id !== item.id);
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

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="h-8 w-8 animate-spin" style={{ color: brand }} />
    </div>
  );

  if (notFound || !restaurant) return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Restaurant non trouvé 😕</h1>
        <p className="text-gray-500">Ce restaurant n'existe pas ou n'est plus en ligne.</p>
        <Link to="/"><button className="px-6 py-3 rounded-lg font-semibold text-white" style={{ backgroundColor: brand }}>Retour à l'accueil</button></Link>
      </div>
    </div>
  );

  const brandLight = `${brand}15`;

  return (
    <div className="min-h-screen bg-white">
      {/* ══════════ NAVBAR ══════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {restaurant.logo_url ? (
              <img src={restaurant.logo_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
            ) : (
              <UtensilsCrossed className="w-6 h-6" style={{ color: brand }} />
            )}
            <span className="font-bold text-gray-900 text-sm">{restaurant.name}</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_SECTIONS.map(s => (
              <button key={s.id} onClick={() => scrollTo(s.id)} className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
                {s.label}
              </button>
            ))}
            {whatsappNumber && (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: brand }}>
                  <Phone className="h-4 w-4" /> Commander
                </button>
              </a>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
            {NAV_SECTIONS.map(s => (
              <button key={s.id} onClick={() => scrollTo(s.id)} className="block w-full text-left text-sm text-gray-700 font-medium py-2 hover:text-gray-900">
                {s.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* ══════════ HERO ══════════ */}
      <section id="accueil" className="relative pt-14">
        <div className="relative h-[70vh] min-h-[400px] max-h-[600px] overflow-hidden">
          {restaurant.cover_url ? (
            <img src={restaurant.cover_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-950" />
          )}
          <div className="absolute inset-0 bg-black/50" />

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            {/* Logo */}
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6 border-2 border-white/30 overflow-hidden">
              {restaurant.logo_url ? (
                <img src={restaurant.logo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <UtensilsCrossed className="h-10 w-10 text-white" />
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white italic">{restaurant.name}</h1>
            {restaurant.cuisine_type && (
              <p className="text-lg text-gray-300 mt-2">{restaurant.cuisine_type}</p>
            )}

            {/* Open/Closed badge */}
            <div className="mt-5">
              <span
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: isOpen ? brand : "#ef4444" }}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${isOpen ? "bg-green-300 animate-pulse" : "bg-red-300"}`} />
                {isOpen ? "Ouvert maintenant" : "Fermé"}
              </span>
            </div>

            {/* CTA */}
            {whatsappNumber && (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-5">
                <button
                  className="flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-bold text-base transition-transform hover:scale-105 active:scale-95"
                  style={{ backgroundColor: brand, boxShadow: `0 4px 20px ${brand}50` }}
                >
                  <Phone className="h-5 w-5" />
                  Commander sur WhatsApp
                </button>
              </a>
            )}

            <ChevronDown className="h-6 w-6 text-white/50 mt-8 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ══════════ MENU ══════════ */}
      <section id="menu" className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 italic">Menu</h2>
          <p className="text-center text-gray-500 mt-2">Découvrez nos plats authentiques préparés avec passion</p>

          {/* Category tabs */}
          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-8">
              <button
                onClick={() => setActiveCategory("all")}
                className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all"
                style={activeCategory === "all" ? { backgroundColor: brand, color: "#fff" } : { backgroundColor: "#f3f4f6", color: "#374151" }}
              >
                Tout
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all"
                  style={activeCategory === cat.id ? { backgroundColor: brand, color: "#fff" } : { backgroundColor: "#f3f4f6", color: "#374151" }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {/* Dish cards — grid with image, name, desc, price, badge */}
          <div className="grid sm:grid-cols-2 gap-4 mt-10">
            {filteredDishes.length === 0 ? (
              <div className="col-span-2 text-center py-16 text-gray-400">
                <UtensilsCrossed className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Aucun plat disponible dans cette catégorie.</p>
              </div>
            ) : (
              filteredDishes.map(item => {
                const selected = isSelected(item.id);
                const qty = getQty(item.id);
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-md cursor-pointer"
                    style={{ borderColor: selected ? brand : "#e5e7eb" }}
                    onClick={() => !selected && toggleItem(item)}
                  >
                    {/* Dish image */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl bg-gray-50">🍽️</div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-sm text-gray-900">{item.name}</h3>
                        {item.is_popular && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded text-white flex-shrink-0" style={{ backgroundColor: brand }}>
                            Populaire
                          </span>
                        )}
                      </div>
                      {item.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{item.description}</p>}
                      <div className="flex items-center justify-between mt-2">
                        <p className="font-bold text-sm" style={{ color: brand }}>
                          {Number(item.price).toLocaleString()} FCFA
                        </p>
                        {selected ? (
                          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => qty <= 1 ? toggleItem(item) : updateQty(item.id, -1)}
                              className="w-7 h-7 rounded-full flex items-center justify-center border"
                              style={{ borderColor: brand, color: brand }}
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-sm font-bold w-5 text-center">{qty}</span>
                            <button
                              onClick={() => updateQty(item.id, 1)}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-white"
                              style={{ backgroundColor: brand }}
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={e => { e.stopPropagation(); toggleItem(item); }}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white"
                            style={{ backgroundColor: brand }}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* ══════════ À PROPOS ══════════ */}
      <section id="about" className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 italic">À Propos</h2>
          <p className="text-center text-gray-500 mt-2">L'histoire d'une passion culinaire</p>

          {restaurant.description && (
            <div className="max-w-2xl mx-auto mt-8">
              <p className="text-gray-600 leading-relaxed text-center">{restaurant.description}</p>
            </div>
          )}

          {/* Values cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {[
              { icon: ChefHat, title: "Authenticité", desc: "Recettes traditionnelles et ingrédients authentiques pour un goût unique" },
              { icon: Heart, title: "Passion", desc: "Chaque plat est préparé avec amour et attention aux détails" },
              { icon: Award, title: "Qualité", desc: "Ingrédients frais sélectionnés avec soin pour garantir l'excellence" },
            ].map((v, i) => (
              <div key={i} className="bg-white rounded-xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4" style={{ backgroundColor: brandLight }}>
                  <v.icon className="h-7 w-7" style={{ color: brand }} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ EMPLACEMENT ══════════ */}
      <section id="location" className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 italic">Notre Emplacement</h2>
          <p className="text-center text-gray-500 mt-2">Venez nous rendre visite</p>

          <div className="grid md:grid-cols-2 gap-8 mt-10">
            {/* Map embed */}
            <div className="rounded-xl overflow-hidden h-72 md:h-80 bg-gray-100">
              {restaurant.latitude && restaurant.longitude ? (
                <iframe
                  title="location"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${restaurant.longitude - 0.01}%2C${restaurant.latitude - 0.01}%2C${restaurant.longitude + 0.01}%2C${restaurant.latitude + 0.01}&layer=mapnik&marker=${restaurant.latitude}%2C${restaurant.longitude}`}
                  allowFullScreen
                  loading="lazy"
                />
              ) : restaurant.address ? (
                <iframe
                  title="location"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(restaurant.address)}&output=embed`}
                  allowFullScreen
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <MapPinned className="h-12 w-12" />
                </div>
              )}
            </div>

            {/* Address info */}
            <div className="flex flex-col justify-center">
              {restaurant.address && (
                <div className="flex items-start gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: brandLight }}>
                    <MapPin className="h-5 w-5" style={{ color: brand }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Adresse</h3>
                    <p className="text-gray-500 text-sm mt-1">{restaurant.address}</p>
                  </div>
                </div>
              )}

              {(restaurant.latitude && restaurant.longitude) ? (
                <a
                  href={`https://www.google.com/maps?q=${restaurant.latitude},${restaurant.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold text-sm transition-transform hover:scale-105"
                  style={{ backgroundColor: brand }}
                >
                  <MapPinned className="h-4 w-4" />
                  Voir sur Google Maps
                </a>
              ) : restaurant.address && (
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(restaurant.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold text-sm transition-transform hover:scale-105"
                  style={{ backgroundColor: brand }}
                >
                  <MapPinned className="h-4 w-4" />
                  Voir sur Google Maps
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ HORAIRES ══════════ */}
      <section id="hours" className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 italic">Horaires d'Ouverture</h2>

          <div className="flex justify-center mt-4">
            <span
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: isOpen ? brand : "#ef4444" }}
            >
              <span className={`w-2 h-2 rounded-full ${isOpen ? "bg-green-300" : "bg-red-300"}`} />
              {isOpen ? "Ouvert maintenant" : "Fermé"}
            </span>
          </div>

          {hours.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm mt-8 overflow-hidden">
              <div className="flex justify-center py-6">
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: brandLight }}>
                  <Clock className="h-7 w-7" style={{ color: brand }} />
                </div>
              </div>
              <div className="px-6 pb-6 space-y-0">
                {hours.map(h => {
                  const now = new Date();
                  const currentDay = (now.getDay() + 6) % 7;
                  const isToday = h.day_of_week === currentDay;
                  return (
                    <div
                      key={h.day_of_week}
                      className={`flex justify-between py-3 px-4 border-b border-gray-50 last:border-0 ${isToday ? "font-bold text-gray-900" : "text-gray-500"}`}
                    >
                      <span>{DAY_NAMES[h.day_of_week]}</span>
                      <span>{h.is_closed ? "Fermé" : `${h.open_time?.slice(0, 5)} - ${h.close_time?.slice(0, 5)}`}</span>
                    </div>
                  );
                })}
              </div>
              <div className="bg-amber-50 text-amber-700 text-sm text-center py-3 px-4">
                ⚠️ Les horaires peuvent varier pendant les jours fériés
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══════════ GALERIE (from dish images) ══════════ */}
      {dishes.filter(d => d.image_url).length >= 4 && (
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 italic">Galerie</h2>
            <p className="text-center text-gray-500 mt-2">Découvrez notre univers en images</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
              {dishes.filter(d => d.image_url).slice(0, 8).map((d, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <img src={d.image_url} alt={d.name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════ CONTACT ══════════ */}
      <section id="contact" className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 italic">Contactez-nous</h2>
          <p className="text-center text-gray-500 mt-2">Nous sommes à votre écoute</p>

          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {restaurant.phone && (
              <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4" style={{ backgroundColor: brandLight }}>
                  <PhoneCall className="h-6 w-6" style={{ color: brand }} />
                </div>
                <h3 className="font-bold text-gray-900">Téléphone</h3>
                <p className="text-sm text-gray-500 mt-1">{restaurant.phone}</p>
                <a href={`tel:${restaurant.phone}`} className="inline-block mt-3 text-sm font-semibold px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                  Appeler
                </a>
              </div>
            )}

            {whatsappNumber && (
              <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4" style={{ backgroundColor: brandLight }}>
                  <MessageCircle className="h-6 w-6" style={{ color: brand }} />
                </div>
                <h3 className="font-bold text-gray-900">WhatsApp</h3>
                <p className="text-sm text-gray-500 mt-1">Messagerie instantanée</p>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-block mt-3 text-sm font-semibold px-4 py-2 rounded-lg text-white transition-transform hover:scale-105"
                  style={{ backgroundColor: brand }}>
                  Envoyer un message
                </a>
              </div>
            )}

            {restaurant.address && (
              <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4" style={{ backgroundColor: brandLight }}>
                  <MapPin className="h-6 w-6" style={{ color: brand }} />
                </div>
                <h3 className="font-bold text-gray-900">Adresse</h3>
                <p className="text-sm text-gray-500 mt-1">{restaurant.address}</p>
                <a href={`https://maps.google.com/?q=${encodeURIComponent(restaurant.address)}`} target="_blank" rel="noopener noreferrer"
                  className="inline-block mt-3 text-sm font-semibold px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                  Voir sur la carte
                </a>
              </div>
            )}
          </div>

          {/* Social links */}
          {(restaurant.social_facebook || restaurant.social_instagram) && (
            <div className="text-center mt-10">
              <h3 className="font-bold text-gray-900 mb-4">Suivez-nous</h3>
              <div className="flex items-center justify-center gap-3">
                {restaurant.social_facebook && (
                  <a href={restaurant.social_facebook} target="_blank" rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:border-gray-400 transition-colors">
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
                {restaurant.social_instagram && (
                  <a href={restaurant.social_instagram} target="_blank" rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:border-gray-400 transition-colors">
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                {restaurant.logo_url ? (
                  <img src={restaurant.logo_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                ) : (
                  <UtensilsCrossed className="w-6 h-6" style={{ color: brand }} />
                )}
                <span className="font-bold">{restaurant.name}</span>
              </div>
              {restaurant.slogan && <p className="text-sm text-gray-400">{restaurant.slogan}</p>}
            </div>

            {/* Quick links */}
            <div>
              <h4 className="font-bold mb-3">Liens Rapides</h4>
              <div className="space-y-2">
                {NAV_SECTIONS.slice(1).map(s => (
                  <button key={s.id} onClick={() => scrollTo(s.id)} className="block text-sm text-gray-400 hover:text-white transition-colors">
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold mb-3">Contact</h4>
              <div className="space-y-2 text-sm text-gray-400">
                {restaurant.phone && (
                  <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> {restaurant.phone}</div>
                )}
                {restaurant.address && (
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {restaurant.address}</div>
                )}
              </div>
            </div>

            {/* Social */}
            <div>
              <h4 className="font-bold mb-3">Suivez-nous</h4>
              <div className="flex gap-3">
                {restaurant.social_facebook && (
                  <a href={restaurant.social_facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
                {restaurant.social_instagram && (
                  <a href={restaurant.social_instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-6 text-center">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} {restaurant.name}. Tous droits réservés. Propulsé par{" "}
              <Link to="/" className="font-semibold hover:underline" style={{ color: brand }}>SamaMenu</Link>
            </p>
          </div>
        </div>
      </footer>

      {/* ══════════ STICKY ORDER BAR ══════════ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-gray-200 shadow-lg">
        <div className="max-w-5xl mx-auto p-3 flex gap-2">
          {/* Reservation button — only if enabled */}
          {restaurant.reservation_enabled && (
            <button
              onClick={() => setShowReservation(true)}
              className="flex items-center justify-center gap-1 px-4 py-3.5 rounded-xl font-bold text-sm border-2 transition-transform active:scale-[0.97]"
              style={{ borderColor: brand, color: brand }}
            >
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Réserver</span>
            </button>
          )}

          {/* Order button */}
          <button
            onClick={() => selectedItems.length > 0 ? setShowCheckout(true) : undefined}
            className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-transform active:scale-[0.97] disabled:opacity-60"
            style={{ backgroundColor: brand, boxShadow: `0 4px 20px ${brand}40` }}
            disabled={selectedItems.length === 0}
          >
            {selectedItems.length > 0 ? (
              <>
                <ShoppingBag className="h-5 w-5" />
                Commander {totalItems} article{totalItems > 1 ? "s" : ""} · {totalPrice.toLocaleString()} FCFA
              </>
            ) : (
              <>
                <ShoppingBag className="h-5 w-5" />
                Sélectionnez des plats
              </>
            )}
          </button>
        </div>
      </div>

      {/* ══════════ MODALS ══════════ */}
      {showCheckout && (
        <CheckoutModal
          restaurant={restaurant}
          items={selectedItems}
          onClose={() => { setShowCheckout(false); setSelectedItems([]); }}
          brand={brand}
        />
      )}
      {showReservation && (
        <ReservationModal
          restaurant={restaurant}
          onClose={() => setShowReservation(false)}
          brand={brand}
        />
      )}
    </div>
  );
};

export default RestaurantPublic;
