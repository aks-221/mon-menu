import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

const RestaurantProfile = () => {
  const [profile, setProfile] = useState({
    name: "Chez Fatou",
    slogan: "Le goût authentique du Sénégal",
    description: "Restaurant de cuisine sénégalaise traditionnelle au cœur de Dakar. Thiéboudienne, Yassa, Mafé et bien plus.",
    cuisineType: "Cuisine locale",
    address: "Rue 10, Médina, Dakar",
    phone: "+221 77 123 45 67",
    whatsapp: "+221 77 123 45 67",
    primaryColor: "#f97316",
  });

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
            <Input value={profile.cuisineType} onChange={(e) => setProfile({ ...profile, cuisineType: e.target.value })} className="rounded-xl" />
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
        <div className="space-y-2">
          <Label>Couleur principale</Label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={profile.primaryColor}
              onChange={(e) => setProfile({ ...profile, primaryColor: e.target.value })}
              className="w-10 h-10 rounded-lg border border-border cursor-pointer"
            />
            <span className="text-sm text-muted-foreground">{profile.primaryColor}</span>
          </div>
        </div>

        <Button className="gradient-primary text-primary-foreground shadow-warm rounded-xl">
          <Save className="h-4 w-4 mr-2" />
          Sauvegarder
        </Button>
      </div>
    </div>
  );
};

export default RestaurantProfile;
