import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

const days = [
  { key: "lundi", label: "Lundi" },
  { key: "mardi", label: "Mardi" },
  { key: "mercredi", label: "Mercredi" },
  { key: "jeudi", label: "Jeudi" },
  { key: "vendredi", label: "Vendredi" },
  { key: "samedi", label: "Samedi" },
  { key: "dimanche", label: "Dimanche" },
];

const HoursManager = () => {
  const [hours, setHours] = useState<Record<string, { open: string; close: string; closed: boolean }>>({
    lundi: { open: "08:00", close: "22:00", closed: false },
    mardi: { open: "08:00", close: "22:00", closed: false },
    mercredi: { open: "08:00", close: "22:00", closed: false },
    jeudi: { open: "08:00", close: "22:00", closed: false },
    vendredi: { open: "08:00", close: "23:00", closed: false },
    samedi: { open: "09:00", close: "23:00", closed: false },
    dimanche: { open: "09:00", close: "15:00", closed: false },
  });

  const toggleClosed = (day: string) => {
    setHours({ ...hours, [day]: { ...hours[day], closed: !hours[day].closed } });
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold">Horaires d'ouverture</h1>
        <p className="text-muted-foreground text-sm">Définissez vos heures d'ouverture pour chaque jour.</p>
      </div>

      <div className="bg-card rounded-2xl border border-border divide-y divide-border">
        {days.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-4 px-4 py-3">
            <span className="w-24 text-sm font-medium">{label}</span>
            {hours[key].closed ? (
              <span className="text-sm text-destructive font-medium flex-1">Fermé</span>
            ) : (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="time"
                  value={hours[key].open}
                  onChange={(e) => setHours({ ...hours, [key]: { ...hours[key], open: e.target.value } })}
                  className="text-sm border border-border rounded-lg px-2 py-1 bg-background"
                />
                <span className="text-muted-foreground text-sm">à</span>
                <input
                  type="time"
                  value={hours[key].close}
                  onChange={(e) => setHours({ ...hours, [key]: { ...hours[key], close: e.target.value } })}
                  className="text-sm border border-border rounded-lg px-2 py-1 bg-background"
                />
              </div>
            )}
            <button
              onClick={() => toggleClosed(key)}
              className={`text-xs px-3 py-1 rounded-full border transition-all ${
                hours[key].closed ? "border-destructive text-destructive" : "border-border text-muted-foreground"
              }`}
            >
              {hours[key].closed ? "Fermé" : "Ouvert"}
            </button>
          </div>
        ))}
      </div>

      <Button className="gradient-primary text-primary-foreground shadow-warm rounded-xl">
        <Save className="h-4 w-4 mr-2" />
        Sauvegarder
      </Button>
    </div>
  );
};

export default HoursManager;
