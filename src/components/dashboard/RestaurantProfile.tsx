import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Save, Loader2, Upload, Image as ImageIcon } from "lucide-react";
import { updateRestaurant } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
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
    primary_color: restaurant.primary_color || "#16a34a",
    social_facebook: restaurant.social_facebook || "",
    social_instagram: restaurant.social_instagram || "",
    logo_url: restaurant.logo_url || "",
    cover_url: restaurant.cover_url || "",
    reservation_enabled: restaurant.reservation_enabled || false,
  });
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File, path: string) => {
    const ext = file.name.split(".").pop();
    const filePath = `${path}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("restaurant-images").upload(filePath, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("restaurant-images").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const url = await uploadImage(file, `logos/${restaurant.id}`);
      setProfile(p => ({ ...p, logo_url: url }));
      toast.success("Logo uploadé !");
    } catch {
      toast.error("Erreur lors de l'upload du logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const url = await uploadImage(file, `covers/${restaurant.id}`);
      setProfile(p => ({ ...p, cover_url: url }));
      toast.success("Photo de couverture uploadée !");
    } catch {
      toast.error("Erreur lors de l'upload");
    } finally {
      setUploadingCover(false);
    }
  };

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
        {/* Logo & Cover uploads */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Logo du restaurant</Label>
            <input type="file" accept="image/*" ref={logoRef} onChange={handleLogoUpload} className="hidden" />
            <div
              onClick={() => logoRef.current?.click()}
              className="w-full h-32 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 transition-colors overflow-hidden"
            >
              {uploadingLogo ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : profile.logo_url ? (
                <img src={profile.logo_url} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Cliquez pour ajouter</span>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Photo de couverture</Label>
            <input type="file" accept="image/*" ref={coverRef} onChange={handleCoverUpload} className="hidden" />
            <div
              onClick={() => coverRef.current?.click()}
              className="w-full h-32 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 transition-colors overflow-hidden"
            >
              {uploadingCover ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : profile.cover_url ? (
                <img src={profile.cover_url} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <>
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Cliquez pour ajouter</span>
                </>
              )}
            </div>
          </div>
        </div>

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

        {/* Reservation toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-border">
          <div>
            <Label className="font-semibold">Réservations de tables</Label>
            <p className="text-xs text-muted-foreground mt-0.5">Permettre aux clients de réserver une table en ligne</p>
          </div>
          <Switch checked={profile.reservation_enabled} onCheckedChange={(v) => setProfile({ ...profile, reservation_enabled: v })} />
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
