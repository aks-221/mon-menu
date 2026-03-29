import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, X, CalendarDays, Users, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ReservationModalProps {
  restaurant: any;
  onClose: () => void;
  brand: string;
}

const ReservationModal = ({ restaurant, onClose, brand }: ReservationModalProps) => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    date: "",
    time: "",
    partySize: "2",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.date || !form.time) {
      return toast.error("Remplissez tous les champs requis");
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("reservations").insert({
        restaurant_id: restaurant.id,
        customer_name: form.name.trim(),
        customer_phone: form.phone.trim(),
        reservation_date: form.date,
        reservation_time: form.time,
        party_size: parseInt(form.partySize),
        notes: form.notes.trim() || null,
        status: "en_attente",
      });
      if (error) throw error;

      // WhatsApp notification
      const whatsappNumber = (restaurant.whatsapp || "").replace(/[^0-9]/g, "");
      if (whatsappNumber) {
        const msg = [
          `📅 *NOUVELLE RÉSERVATION*`,
          ``,
          `👤 *Nom :* ${form.name}`,
          `📞 *Tél :* ${form.phone}`,
          `📅 *Date :* ${new Date(form.date).toLocaleDateString("fr-FR")}`,
          `🕐 *Heure :* ${form.time}`,
          `👥 *Personnes :* ${form.partySize}`,
          form.notes ? `📝 *Notes :* ${form.notes}` : "",
        ].filter(Boolean).join("\n");
        window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, "_blank");
      }

      toast.success("Réservation envoyée ! 🎉");
      onClose();
    } catch {
      toast.error("Erreur lors de la réservation");
    } finally {
      setSubmitting(false);
    }
  };

  // Minimum date = today
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-end md:items-center justify-center" onClick={onClose}>
      <div className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white z-10 border-b border-gray-100 p-4 flex items-center justify-between rounded-t-3xl">
          <h2 className="font-bold text-lg">Réserver une table</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Votre nom *</Label>
            <Input placeholder="ex: Fatou Ndiaye" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="rounded-xl" />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Téléphone *</Label>
            <Input placeholder="ex: 77 123 45 67" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="rounded-xl" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Date *</Label>
              <Input type="date" min={today} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Heure *</Label>
              <Input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className="rounded-xl" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Nombre de personnes</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 8, 10].map(n => (
                <button
                  key={n}
                  onClick={() => setForm({ ...form, partySize: String(n) })}
                  className="w-10 h-10 rounded-xl border-2 text-sm font-bold transition-all"
                  style={{
                    borderColor: form.partySize === String(n) ? brand : "#e5e7eb",
                    backgroundColor: form.partySize === String(n) ? `${brand}15` : "transparent",
                    color: form.partySize === String(n) ? brand : "#374151",
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Notes (optionnel)</Label>
            <Input placeholder="ex: Table en terrasse si possible" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="rounded-xl" />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-transform active:scale-[0.97] disabled:opacity-60"
            style={{ backgroundColor: brand }}
          >
            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <>
              <CalendarDays className="h-5 w-5" /> Réserver
            </>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationModal;
