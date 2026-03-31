import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, Phone, MapPin, Clock, ChevronDown, User, Truck, ShoppingBag, Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateReceipt } from "@/lib/generateReceipt";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  en_attente: { label: "En attente", color: "bg-yellow-100 text-yellow-800" },
  acceptee: { label: "Acceptée", color: "bg-blue-100 text-blue-800" },
  en_preparation: { label: "En préparation", color: "bg-purple-100 text-purple-800" },
  prete: { label: "Prête", color: "bg-green-100 text-green-800" },
  livree: { label: "Livrée", color: "bg-emerald-100 text-emerald-800" },
  annulee: { label: "Annulée", color: "bg-red-100 text-red-800" },
};

const STATUS_FLOW = ["en_attente", "acceptee", "en_preparation", "prete", "livree"];

const OrdersManager = ({ restaurant }: { restaurant: any }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .order("created_at", { ascending: false });
    if (error) { toast.error("Erreur de chargement"); return; }
    setOrders(data || []);
    setLoading(false);
  };

  const loadItems = async (orderId: string) => {
    if (orderItems[orderId]) return;
    const { data } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);
    setOrderItems(prev => ({ ...prev, [orderId]: data || [] }));
  };

  useEffect(() => {
    loadOrders();
    // Realtime
    const channel = supabase
      .channel("orders-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `restaurant_id=eq.${restaurant.id}` }, () => {
        loadOrders();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [restaurant.id]);

  const updateStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) { toast.error("Erreur"); return; }
    setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
    toast.success(`Statut mis à jour : ${STATUS_CONFIG[status]?.label}`);
  };

  const toggleExpand = (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
      loadItems(orderId);
    }
  };

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Commandes</h1>
        <p className="text-muted-foreground text-sm">{orders.length} commande{orders.length > 1 ? "s" : ""} au total</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button onClick={() => setFilter("all")}
          className={`text-sm px-4 py-2 rounded-full whitespace-nowrap transition-all ${filter === "all" ? "bg-primary text-primary-foreground font-medium" : "bg-secondary text-secondary-foreground"}`}>
          Toutes ({orders.length})
        </button>
        {Object.entries(STATUS_CONFIG).map(([key, val]) => {
          const count = orders.filter(o => o.status === key).length;
          return (
            <button key={key} onClick={() => setFilter(key)}
              className={`text-sm px-4 py-2 rounded-full whitespace-nowrap transition-all ${filter === key ? "bg-primary text-primary-foreground font-medium" : "bg-secondary text-secondary-foreground"}`}>
              {val.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Aucune commande</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <div key={order.id} className="bg-card rounded-2xl border border-border overflow-hidden">
              {/* Header */}
              <button onClick={() => toggleExpand(order.id)} className="w-full p-4 flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {order.order_type === "delivery" ? <Truck className="h-5 w-5 text-primary" /> : <ShoppingBag className="h-5 w-5 text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{order.customer_name}</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${STATUS_CONFIG[order.status]?.color}`}>
                      {STATUS_CONFIG[order.status]?.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(order.created_at)}</span>
                    <span className="font-semibold text-foreground">{Number(order.total).toLocaleString()} FCFA</span>
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedOrder === order.id ? "rotate-180" : ""}`} />
              </button>

              {/* Expanded details */}
              {expandedOrder === order.id && (
                <div className="border-t border-border p-4 space-y-4">
                  {/* Customer info */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{order.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${order.customer_phone}`} className="text-primary">{order.customer_phone}</a>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {order.order_type === "delivery" ? <Truck className="h-4 w-4 text-muted-foreground" /> : <ShoppingBag className="h-4 w-4 text-muted-foreground" />}
                      <span>{order.order_type === "delivery" ? "Livraison" : "À emporter"}</span>
                    </div>
                    {order.delivery_address && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{order.delivery_address}</span>
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  <div className="bg-secondary/50 rounded-xl p-3 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Articles</p>
                    {(orderItems[order.id] || []).map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.dish_name} × {item.quantity}</span>
                        <span className="font-semibold">{Number(item.total_price).toLocaleString()} FCFA</span>
                      </div>
                    ))}
                    <div className="border-t border-border pt-2 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Sous-total</span>
                        <span>{Number(order.subtotal).toLocaleString()} FCFA</span>
                      </div>
                      {order.delivery_fee > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Livraison</span>
                          <span>{Number(order.delivery_fee).toLocaleString()} FCFA</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-bold">
                        <span>Total</span>
                        <span className="text-primary">{Number(order.total).toLocaleString()} FCFA</span>
                      </div>
                    </div>
                  </div>

                  {/* Status actions */}
                  {order.status !== "livree" && order.status !== "annulee" && (
                    <div className="flex flex-wrap gap-2">
                      {STATUS_FLOW.filter(s => STATUS_FLOW.indexOf(s) > STATUS_FLOW.indexOf(order.status)).map(s => (
                        <Button key={s} size="sm" variant="outline" className="rounded-xl text-xs"
                          onClick={() => updateStatus(order.id, s)}>
                          {STATUS_CONFIG[s]?.label}
                        </Button>
                      ))}
                      <Button size="sm" variant="outline" className="rounded-xl text-xs text-destructive border-destructive/30"
                        onClick={() => updateStatus(order.id, "annulee")}>
                        Annuler
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersManager;
