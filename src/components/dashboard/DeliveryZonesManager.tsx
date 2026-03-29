import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Loader2, Truck, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { updateRestaurant } from "@/lib/api";
import { toast } from "sonner";

const DeliveryZonesManager = ({ restaurant, onUpdate }: { restaurant: any; onUpdate: (r: any) => void }) => {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newZone, setNewZone] = useState({ name: "", neighborhoods: "", price: "" });
  const [deliveryEnabled, setDeliveryEnabled] = useState(restaurant.delivery_enabled || false);

  const loadZones = async () => {
    const { data } = await supabase
      .from("delivery_zones")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .order("sort_order");
    setZones(data || []);
    setLoading(false);
  };

  useEffect(() => { loadZones(); }, [restaurant.id]);

  const toggleDelivery = async (enabled: boolean) => {
    setDeliveryEnabled(enabled);
    await updateRestaurant(restaurant.id, { delivery_enabled: enabled });
    onUpdate({ ...restaurant, delivery_enabled: enabled });
    toast.success(enabled ? "Livraison activée" : "Livraison désactivée");
  };

  const handleAdd = async () => {
    if (!newZone.name || !newZone.price) return toast.error("Nom et prix requis");
    setAdding(true);
    try {
      const { data, error } = await supabase
        .from("delivery_zones")
        .insert({
          restaurant_id: restaurant.id,
          name: newZone.name,
          neighborhoods: newZone.neighborhoods,
          price: parseInt(newZone.price),
          sort_order: zones.length,
        })
        .select()
        .single();
      if (error) throw error;
      setZones([...zones, data]);
      setNewZone({ name: "", neighborhoods: "", price: "" });
      toast.success("Zone ajoutée !");
    } catch {
      toast.error("Erreur lors de l'ajout");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("delivery_zones").delete().eq("id", id);
    setZones(zones.filter(z => z.id !== id));
    toast.success("Zone supprimée");
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Livraison</h1>
          <p className="text-muted-foreground text-sm">Configurez vos zones et frais de livraison</p>
        </div>
      </div>

      {/* Toggle delivery */}
      <div className="bg-card rounded-2xl border border-border p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Truck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold">Activer la livraison</p>
            <p className="text-xs text-muted-foreground">Les clients pourront choisir la livraison lors de la commande</p>
          </div>
        </div>
        <Switch checked={deliveryEnabled} onCheckedChange={toggleDelivery} />
      </div>

      {deliveryEnabled && (
        <>
          {/* Add zone form */}
          <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
            <h3 className="font-bold flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Ajouter une zone</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Nom de la zone</Label>
                <Input placeholder="ex: Zone 1" value={newZone.name} onChange={e => setNewZone({ ...newZone, name: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Quartiers</Label>
                <Input placeholder="ex: Almadies, Ngor, Ouakam" value={newZone.neighborhoods} onChange={e => setNewZone({ ...newZone, neighborhoods: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Prix (FCFA)</Label>
                <Input type="number" placeholder="500" value={newZone.price} onChange={e => setNewZone({ ...newZone, price: e.target.value })} className="rounded-xl" />
              </div>
            </div>
            <Button onClick={handleAdd} disabled={adding} className="gradient-primary text-primary-foreground rounded-xl">
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-2" /> Ajouter la zone</>}
            </Button>
          </div>

          {/* Zones list */}
          <div className="space-y-3">
            {zones.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Truck className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Aucune zone configurée</p>
                <p className="text-sm mt-1">Ajoutez des zones pour activer la livraison</p>
              </div>
            ) : (
              zones.map(zone => (
                <div key={zone.id} className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm">{zone.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{zone.neighborhoods}</p>
                  </div>
                  <span className="font-bold text-primary text-sm whitespace-nowrap">{Number(zone.price).toLocaleString()} FCFA</span>
                  <button onClick={() => handleDelete(zone.id)} className="p-2 rounded-lg hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DeliveryZonesManager;
