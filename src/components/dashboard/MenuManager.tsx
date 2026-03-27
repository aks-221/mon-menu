import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ToggleLeft, ToggleRight, Star, Loader2 } from "lucide-react";
import { fetchCategories, fetchDishes, addDish, updateDish, deleteDishById } from "@/lib/api";
import { toast } from "sonner";

const MenuManager = ({ restaurant }: { restaurant: any }) => {
  const [dishes, setDishes] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDish, setNewDish] = useState({ name: "", description: "", price: "", category_id: "" });
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const loadData = async () => {
    try {
      const [cats, dsh] = await Promise.all([
        fetchCategories(restaurant.id),
        fetchDishes(restaurant.id),
      ]);
      setCategories(cats);
      setDishes(dsh);
      if (cats.length > 0 && !newDish.category_id) {
        setNewDish((prev) => ({ ...prev, category_id: cats[0].id }));
      }
    } catch {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [restaurant.id]);

  const filtered = activeCategory === "Tous"
    ? dishes
    : dishes.filter((d) => d.category_id === activeCategory);

  const toggleAvailable = async (dish: any) => {
    await updateDish(dish.id, { is_available: !dish.is_available });
    setDishes(dishes.map((d) => d.id === dish.id ? { ...d, is_available: !d.is_available } : d));
  };

  const togglePopular = async (dish: any) => {
    await updateDish(dish.id, { is_popular: !dish.is_popular });
    setDishes(dishes.map((d) => d.id === dish.id ? { ...d, is_popular: !d.is_popular } : d));
  };

  const handleDelete = async (id: string) => {
    await deleteDishById(id);
    setDishes(dishes.filter((d) => d.id !== id));
    toast.success("Plat supprimé");
  };

  const handleAdd = async () => {
    if (!newDish.name || !newDish.price) return toast.error("Nom et prix requis");
    setAdding(true);
    try {
      const dish = await addDish({
        restaurant_id: restaurant.id,
        category_id: newDish.category_id || null,
        name: newDish.name,
        description: newDish.description,
        price: parseInt(newDish.price),
        tags: [],
      });
      setDishes([...dishes, dish]);
      setNewDish({ name: "", description: "", price: "", category_id: categories[0]?.id || "" });
      setShowAddForm(false);
      toast.success("Plat ajouté !");
    } catch {
      toast.error("Erreur lors de l'ajout");
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Menu</h1>
          <p className="text-muted-foreground text-sm">{dishes.length} plats • {dishes.filter(d => d.is_available).length} disponibles</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="gradient-primary text-primary-foreground shadow-warm rounded-xl">
          <Plus className="h-4 w-4 mr-2" />Ajouter
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
            <Input placeholder="Courte description" value={newDish.description} onChange={(e) => setNewDish({ ...newDish, description: e.target.value })} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Catégorie</Label>
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => setNewDish({ ...newDish, category_id: cat.id })}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    newDish.category_id === cat.id ? "border-primary bg-primary/10 text-primary font-medium" : "border-border"
                  }`}>{cat.name}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd} disabled={adding} className="gradient-primary text-primary-foreground rounded-xl">
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ajouter"}
            </Button>
            <Button variant="ghost" onClick={() => setShowAddForm(false)}>Annuler</Button>
          </div>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2">
        <button onClick={() => setActiveCategory("Tous")}
          className={`text-sm px-4 py-2 rounded-full whitespace-nowrap transition-all ${
            activeCategory === "Tous" ? "bg-primary text-primary-foreground font-medium" : "bg-secondary text-secondary-foreground"
          }`}>Tous</button>
        {categories.map((cat) => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
            className={`text-sm px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              activeCategory === cat.id ? "bg-primary text-primary-foreground font-medium" : "bg-secondary text-secondary-foreground"
            }`}>{cat.name}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Aucun plat dans cette catégorie.</p>
          <p className="text-sm mt-1">Cliquez sur "Ajouter" pour créer votre premier plat.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((dish) => (
            <div key={dish.id}
              className={`bg-card rounded-2xl border border-border p-4 flex items-center gap-4 transition-opacity ${!dish.is_available ? "opacity-50" : ""}`}>
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex-shrink-0 flex items-center justify-center text-2xl">🍽️</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm truncate">{dish.name}</h3>
                  {dish.is_popular && <Star className="h-3.5 w-3.5 text-warning fill-warning flex-shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground truncate">{dish.description}</p>
                <p className="text-sm font-bold text-primary mt-0.5">{Number(dish.price).toLocaleString()} FCFA</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => togglePopular(dish)} title="Populaire" className="p-2 rounded-lg hover:bg-secondary">
                  <Star className={`h-4 w-4 ${dish.is_popular ? "text-warning fill-warning" : "text-muted-foreground"}`} />
                </button>
                <button onClick={() => toggleAvailable(dish)} title="Disponibilité" className="p-2 rounded-lg hover:bg-secondary">
                  {dish.is_available ? <ToggleRight className="h-5 w-5 text-accent" /> : <ToggleLeft className="h-5 w-5 text-muted-foreground" />}
                </button>
                <button onClick={() => handleDelete(dish.id)} title="Supprimer" className="p-2 rounded-lg hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuManager;
