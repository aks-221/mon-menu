import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Clock, Phone, MessageCircle, Star, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const menuData = {
  "Entrées": [
    { name: "Pastels", description: "Beignets farcis au poisson", price: 1000, popular: false, available: true, tags: ["🐟"] },
    { name: "Salade Fatou", description: "Salade fraîche de saison", price: 800, popular: false, available: true, tags: ["🌱"] },
  ],
  "Plats": [
    { name: "Thiéboudienne", description: "Riz au poisson, le plat national", price: 2500, popular: true, available: true, tags: ["🐟"] },
    { name: "Yassa Poulet", description: "Poulet mariné aux oignons et citron", price: 2000, popular: false, available: true, tags: [] },
    { name: "Mafé", description: "Sauce arachide avec viande et légumes", price: 1800, popular: false, available: true, tags: ["🥜"] },
    { name: "Thiou", description: "Sauce tomate avec poisson frais", price: 2200, popular: false, available: false, tags: ["🐟"] },
  ],
  "Boissons": [
    { name: "Bissap", description: "Jus d'hibiscus frais", price: 500, popular: true, available: true, tags: ["🌱"] },
    { name: "Gingembre", description: "Jus de gingembre maison", price: 500, popular: false, available: true, tags: ["🌱"] },
    { name: "Bouye", description: "Jus de baobab onctueux", price: 600, popular: false, available: true, tags: [] },
  ],
};

const categories = Object.keys(menuData);

const RestaurantPublic = () => {
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const isOpen = true; // mock

  const toggleItem = (name: string) => {
    setSelectedItems((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const whatsappMessage = selectedItems.length > 0
    ? `Bonjour ! Je souhaite commander :\n${selectedItems.map((item) => `- ${item}`).join("\n")}\nMerci !`
    : "Bonjour ! Je souhaite passer une commande.";

  const whatsappUrl = `https://wa.me/221771234567?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header/Cover */}
      <div className="relative bg-primary h-44">
        <div className="absolute inset-0 gradient-primary opacity-90" />
        <div className="absolute top-4 left-4">
          <Link to="/" className="inline-flex items-center gap-1 text-primary-foreground/80 text-sm">
            <ArrowLeft className="h-4 w-4" /> Retour
          </Link>
        </div>
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <div className="w-24 h-24 rounded-2xl bg-card border-4 border-background shadow-lg flex items-center justify-center text-3xl">
            🍽️
          </div>
        </div>
      </div>

      {/* Restaurant info */}
      <div className="pt-16 px-4 text-center space-y-2 max-w-lg mx-auto">
        <h1 className="text-2xl font-extrabold">Chez Fatou</h1>
        <p className="text-muted-foreground text-sm">Le goût authentique du Sénégal</p>
        <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
          <span className="bg-secondary px-2 py-1 rounded-full">🍛 Cuisine locale</span>
          <span className={`px-2 py-1 rounded-full font-medium ${isOpen ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"}`}>
            {isOpen ? "🟢 Ouvert" : "🔴 Fermé"}
          </span>
        </div>
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Médina, Dakar</span>
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 08h - 22h</span>
        </div>
      </div>

      {/* Category tabs */}
      <div className="mt-6 px-4 max-w-lg mx-auto">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-sm px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground font-medium"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu items */}
      <div className="mt-4 px-4 pb-28 max-w-lg mx-auto space-y-3">
        {(menuData[activeCategory as keyof typeof menuData] || []).map((item) => (
          <button
            key={item.name}
            onClick={() => item.available && toggleItem(item.name)}
            disabled={!item.available}
            className={`w-full text-left rounded-2xl border-2 p-4 flex items-center gap-3 transition-all ${
              !item.available
                ? "opacity-40 border-border"
                : selectedItems.includes(item.name)
                ? "border-primary bg-primary/5 shadow-warm"
                : "border-border bg-card hover:border-primary/30"
            }`}
          >
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-2xl flex-shrink-0">
              🍽️
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm">{item.name}</h3>
                {item.popular && <Star className="h-3.5 w-3.5 text-warning fill-warning" />}
                {item.tags.map((t) => <span key={t} className="text-xs">{t}</span>)}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
              <p className="text-sm font-bold text-primary mt-1">{item.price.toLocaleString()} FCFA</p>
              {!item.available && <p className="text-xs text-destructive font-medium">Indisponible</p>}
            </div>
            {item.available && (
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                selectedItems.includes(item.name) ? "border-primary bg-primary" : "border-border"
              }`}>
                {selectedItems.includes(item.name) && <span className="text-primary-foreground text-xs">✓</span>}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* WhatsApp floating button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-border max-w-lg mx-auto">
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block">
          <Button className="w-full py-6 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-[#fff] font-bold text-base shadow-lg">
            <MessageCircle className="h-5 w-5 mr-2" />
            {selectedItems.length > 0
              ? `Commander ${selectedItems.length} plat${selectedItems.length > 1 ? "s" : ""} sur WhatsApp`
              : "Commander sur WhatsApp"
            }
          </Button>
        </a>
      </div>

      {/* Footer */}
      <div className="text-center pb-4 pt-2 max-w-lg mx-auto">
        <p className="text-xs text-muted-foreground">
          Propulsé par <Link to="/" className="text-primary font-semibold">MenuUp</Link>
        </p>
      </div>
    </div>
  );
};

export default RestaurantPublic;
