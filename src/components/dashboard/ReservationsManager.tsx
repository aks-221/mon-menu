import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CalendarDays, Phone, User, Users, Clock, Check, X, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateReservationReceipt } from "@/lib/generateReceipt";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  en_attente: { label: "En attente", color: "bg-yellow-100 text-yellow-800" },
  acceptee: { label: "Acceptée", color: "bg-green-100 text-green-800" },
  refusee: { label: "Refusée", color: "bg-red-100 text-red-800" },
};

const ReservationsManager = ({ restaurant }: { restaurant: any }) => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const loadReservations = async () => {
    const { data } = await supabase
      .from("reservations")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .order("reservation_date", { ascending: false });
    setReservations(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadReservations();
    const channel = supabase
      .channel("reservations-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "reservations", filter: `restaurant_id=eq.${restaurant.id}` }, () => {
        loadReservations();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [restaurant.id]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("reservations").update({ status }).eq("id", id);
    if (error) { toast.error("Erreur"); return; }
    setReservations(reservations.map(r => r.id === id ? { ...r, status } : r));
    toast.success(`Réservation ${STATUS_CONFIG[status]?.label.toLowerCase()}`);
  };

  const filtered = filter === "all" ? reservations : reservations.filter(r => r.status === filter);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Réservations</h1>
        <p className="text-muted-foreground text-sm">{reservations.length} réservation{reservations.length > 1 ? "s" : ""}</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button onClick={() => setFilter("all")}
          className={`text-sm px-4 py-2 rounded-full whitespace-nowrap transition-all ${filter === "all" ? "bg-primary text-primary-foreground font-medium" : "bg-secondary text-secondary-foreground"}`}>
          Toutes ({reservations.length})
        </button>
        {Object.entries(STATUS_CONFIG).map(([key, val]) => {
          const count = reservations.filter(r => r.status === key).length;
          return (
            <button key={key} onClick={() => setFilter(key)}
              className={`text-sm px-4 py-2 rounded-full whitespace-nowrap transition-all ${filter === key ? "bg-primary text-primary-foreground font-medium" : "bg-secondary text-secondary-foreground"}`}>
              {val.label} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Aucune réservation</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(res => (
            <div key={res.id} className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CalendarDays className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{res.customer_name}</span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${STATUS_CONFIG[res.status]?.color}`}>
                        {STATUS_CONFIG[res.status]?.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                      <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{new Date(res.reservation_date).toLocaleDateString("fr-FR")}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{res.reservation_time?.slice(0, 5)}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{res.party_size} pers.</span>
                      <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{res.customer_phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {res.status === "en_attente" && (
                <div className="flex gap-2 mt-3 ml-13">
                  <Button size="sm" className="rounded-xl text-xs gradient-primary text-primary-foreground" onClick={() => updateStatus(res.id, "acceptee")}>
                    <Check className="h-3 w-3 mr-1" /> Accepter
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-xl text-xs text-destructive border-destructive/30" onClick={() => updateStatus(res.id, "refusee")}>
                    <X className="h-3 w-3 mr-1" /> Refuser
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReservationsManager;
