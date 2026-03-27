import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";
import { fetchBusinessHours, updateBusinessHours } from "@/lib/api";
import { toast } from "sonner";

const dayLabels = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

const HoursManager = ({ restaurant }: { restaurant: any }) => {
  const [hours, setHours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBusinessHours(restaurant.id).then((data) => {
      setHours(data);
      setLoading(false);
    });
  }, [restaurant.id]);

  const updateHour = (dayOfWeek: number, field: string, value: any) => {
    setHours(hours.map((h) => h.day_of_week === dayOfWeek ? { ...h, [field]: value } : h));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateBusinessHours(restaurant.id, hours.map((h) => ({
        day_of_week: h.day_of_week,
        open_time: h.open_time,
        close_time: h.close_time,
        is_closed: h.is_closed,
      })));
      toast.success("Horaires mis à jour !");
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold">Horaires d'ouverture</h1>
        <p className="text-muted-foreground text-sm">Définissez vos heures d'ouverture pour chaque jour.</p>
      </div>

      <div className="bg-card rounded-2xl border border-border divide-y divide-border">
        {hours.map((h) => (
          <div key={h.day_of_week} className="flex items-center gap-4 px-4 py-3">
            <span className="w-24 text-sm font-medium">{dayLabels[h.day_of_week]}</span>
            {h.is_closed ? (
              <span className="text-sm text-destructive font-medium flex-1">Fermé</span>
            ) : (
              <div className="flex items-center gap-2 flex-1">
                <input type="time" value={h.open_time?.slice(0, 5) || "08:00"}
                  onChange={(e) => updateHour(h.day_of_week, "open_time", e.target.value)}
                  className="text-sm border border-border rounded-lg px-2 py-1 bg-background" />
                <span className="text-muted-foreground text-sm">à</span>
                <input type="time" value={h.close_time?.slice(0, 5) || "22:00"}
                  onChange={(e) => updateHour(h.day_of_week, "close_time", e.target.value)}
                  className="text-sm border border-border rounded-lg px-2 py-1 bg-background" />
              </div>
            )}
            <button onClick={() => updateHour(h.day_of_week, "is_closed", !h.is_closed)}
              className={`text-xs px-3 py-1 rounded-full border transition-all ${
                h.is_closed ? "border-destructive text-destructive" : "border-border text-muted-foreground"
              }`}>{h.is_closed ? "Fermé" : "Ouvert"}</button>
          </div>
        ))}
      </div>

      <Button onClick={handleSave} disabled={saving} className="gradient-primary text-primary-foreground shadow-warm rounded-xl">
        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
        Sauvegarder
      </Button>
    </div>
  );
};

export default HoursManager;
