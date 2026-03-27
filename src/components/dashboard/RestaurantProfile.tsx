import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";
import { updateRestaurant } from "@/lib/api";
import { toast } from "sonner";

const RestaurantProfile = ({ restaurant, onUpdate }: { restaurant: any; onUpdate: (r: any) => void }) => {
  const [profile, setProfile] = useState({
    name: restaurant.name || "",
    slogan: restaurant.slogan || "",
    description: restaurant.description || "",
    cuisine_type: restaurant.cuisine_type || "",
    address: restaurant.address || "",
    phone: restaurant.phone || "",
    whatsapp: restaurant.whatsapp || "",
    primary_color: restaurant.primary_color || "#f97316",
    social_facebook: restaurant.social_facebook || "",
    social_instagram: restaurant.social_instagram || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateRestaurant(restaurant.id, profile);
      onUpdate({ ...restaurant, ...profile });
      toast.success("Profil mis à jour !");
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Profil du restaurant</h1>
        <p className="text-muted-foreground text-sm">Personnalisez les informations de votre restaurant.</p>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nom du restaurant</Label>
            <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Type de cuisine</Label>
            <Input value={profile.cuisine_type} onChange={(e) => setProfile({ ...profile, cuisine_type: e.target.value })} className="rounded-xl" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Slogan</Label>
          <Input value={profile.slogan} onChange={(e) => setProfile({ ...profile, slogan: e.target.value })} className="rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea value={profile.description} onChange={(e) => setProfile({ ...profile, description: e.target.value })} className="rounded-xl min-h-[100px]" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Téléphone</Label>
            <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>WhatsApp</Label>
            <Input value={profile.whatsapp} onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })} className="rounded-xl" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Adresse</Label>
          <Input value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} className="rounded-xl" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Facebook</Label>
            <Input placeholder="https://facebook.com/..." value={profile.social_facebook} onChange={(e) => setProfile({ ...profile, social_facebook: e.target.value })} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Instagram</Label>
            <Input placeholder="https://instagram.com/..." value={profile.social_instagram} onChange={(e) => setProfile({ ...profile, social_instagram: e.target.value })} className="rounded-xl" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Couleur principale</Label>
          <div className="flex items-center gap-3">
            <input type="color" value={profile.primary_color} onChange={(e) => setProfile({ ...profile, primary_color: e.target.value })} className="w-10 h-10 rounded-lg border border-border cursor-pointer" />
            <span className="text-sm text-muted-foreground">{profile.primary_color}</span>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="gradient-primary text-primary-foreground shadow-warm rounded-xl">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Sauvegarder
        </Button>
      </div>
    </div>
  );
};

export default RestaurantProfile;
