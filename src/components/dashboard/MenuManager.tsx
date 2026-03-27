import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ToggleLeft, ToggleRight, Star, Flame } from "lucide-react";

interface Dish {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  available: boolean;
  popular: boolean;
  tags: string[];
}

const initialDishes: Dish[] = [
  { id: "1", name: "Thiéboudienne", description: "Le plat national sénégalais à base de riz et poisson", price: "2500", category: "Plats", available: true, popular: true, tags: ["🐟"] },
  { id: "2", name: "Yassa Poulet", description: "Poulet mariné aux oignons et citron", price: "2000", category: "Plats", available: true, popular: false, tags: [] },
  { id: "3", name: "Mafé", description: "Sauce arachide avec viande et légumes", price: "1800", category: "Plats", available: true, popular: false, tags: ["🥜"] },
  { id: "4", name: "Bissap", description: "Boisson rafraîchissante à l'hibiscus", price: "500", category: "Boissons", available: true, popular: true, tags: ["🌱"] },
  { id: "5", name: "Pastels", description: "Beignets farcis au poisson", price: "1000", category: "Entrées", available: false, popular: false, tags: ["🐟"] },
];

const categories = ["Tous", "Entrées", "Plats", "Boissons", "Desserts"];

const MenuManager = () => {
  const [dishes, setDishes] = useState<Dish[]>(initialDishes);
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDish, setNewDish] = useState({ name: "", description: "", price: "", category: "Plats" });

  const filtered = activeCategory === "Tous" ? dishes : dishes.filter((d) => d.category === activeCategory);

  const toggleAvailable = (id: string) => {
    setDishes(dishes.map((d) => d.id === id ? { ...d, available: !d.available } : d));
  };

  const togglePopular = (id: string) => {
    setDishes(dishes.map((d) => d.id === id ? { ...d, popular: !d.popular } : d));
  };

  const deleteDish = (id: string) => {
    setDishes(dishes.filter((d) => d.id !== id));
  };

  const addDish = () => {
    if (!newDish.name || !newDish.price) return;
    setDishes([...dishes, {
      id: Date.now().toString(),
      name: newDish.name,
      description: newDish.description,
      price: newDish.price,
      category: newDish.category,
      available: true,
      popular: false,
      tags: [],
    }]);
    setNewDish({ name: "", description: "", price: "", category: "Plats" });
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Menu</h1>
          <p className="text-muted-foreground text-sm">{dishes.length} plats • {dishes.filter(d => d.available).length} disponibles</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="gradient-primary text-primary-foreground shadow-warm rounded-xl">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un plat
        </Button>
      </div>

      {showAddForm && (
        <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
          <h3 className="font-bold">Nouveau plat</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input placeholder="ex: Thiéboudienne" value={newDish.name} onChange={(e) => setNewDish({ ...newDish, name: e.target.value })} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Prix (FCFA)</Label>
              <Input type="number" placeholder="2500" value={newDish.price} onChange={(e) => setNewDish({ ...newDish, price: e.target.value })} className="rounded-xl" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input placeholder="Courte description du plat" value={newDish.description} onChange={(e) => setNewDish({ ...newDish, description: e.target.value })} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Catégorie</Label>
            <div className="flex gap-2 flex-wrap">
              {categories.filter(c => c !== "Tous").map((cat) => (
                <button
                  key={cat}
                  onClick={() => setNewDish({ ...newDish, category: cat })}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    newDish.category === cat ? "border-primary bg-primary/10 text-primary font-medium" : "border-border"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={addDish} className="gradient-primary text-primary-foreground rounded-xl">Ajouter</Button>
            <Button variant="ghost" onClick={() => setShowAddForm(false)}>Annuler</Button>
          </div>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-sm px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              activeCategory === cat
                ? "bg-primary text-primary-foreground font-medium"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((dish) => (
          <div
            key={dish.id}
            className={`bg-card rounded-2xl border border-border p-4 flex items-center gap-4 transition-opacity ${
              !dish.available ? "opacity-50" : ""
            }`}
          >
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex-shrink-0 flex items-center justify-center text-2xl">
              🍽️
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm truncate">{dish.name}</h3>
                {dish.popular && <Star className="h-3.5 w-3.5 text-warning fill-warning flex-shrink-0" />}
                {dish.tags.map((t) => <span key={t} className="text-xs">{t}</span>)}
              </div>
              <p className="text-xs text-muted-foreground truncate">{dish.description}</p>
              <p className="text-sm font-bold text-primary mt-0.5">{Number(dish.price).toLocaleString()} FCFA</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => togglePopular(dish.id)} title="Populaire" className="p-2 rounded-lg hover:bg-secondary">
                <Star className={`h-4 w-4 ${dish.popular ? "text-warning fill-warning" : "text-muted-foreground"}`} />
              </button>
              <button onClick={() => toggleAvailable(dish.id)} title="Disponibilité" className="p-2 rounded-lg hover:bg-secondary">
                {dish.available
                  ? <ToggleRight className="h-5 w-5 text-accent" />
                  : <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                }
              </button>
              <button onClick={() => deleteDish(dish.id)} title="Supprimer" className="p-2 rounded-lg hover:bg-destructive/10">
                <Trash2 className="h-4 w-4 text-destructive" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuManager;
