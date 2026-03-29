import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, X, Truck, ShoppingBag, MapPin, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

interface CheckoutModalProps {
  restaurant: any;
  items: CartItem[];
  onClose: () => void;
  brand: string;
}

const CheckoutModal = ({ restaurant, items, onClose, brand }: CheckoutModalProps) => {
  const [step, setStep] = useState(1);
  const [orderType, setOrderType] = useState<"pickup" | "delivery">("pickup");
  const [zones, setZones] = useState<any[]>([]);
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [submitting, setSubmitting] = useState(false);

  const deliveryEnabled = restaurant.delivery_enabled;

  useEffect(() => {
    if (deliveryEnabled) {
      supabase
        .from("delivery_zones")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("sort_order")
        .then(({ data }) => setZones(data || []));
    }
  }, [restaurant.id, deliveryEnabled]);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryFee = orderType === "delivery" && selectedZone ? selectedZone.price : 0;
  const total = subtotal + deliveryFee;

  const whatsappNumber = (restaurant.whatsapp || "").replace(/[^0-9]/g, "");

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.phone.trim()) return toast.error("Nom et téléphone requis");
    if (orderType === "delivery" && !selectedZone) return toast.error("Choisissez une zone de livraison");
    if (orderType === "delivery" && !form.address.trim()) return toast.error("Adresse de livraison requise");

    setSubmitting(true);
    try {
      // Save order
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          restaurant_id: restaurant.id,
          customer_name: form.name.trim(),
          customer_phone: form.phone.trim(),
          order_type: orderType,
          delivery_zone_id: orderType === "delivery" ? selectedZone?.id : null,
          delivery_address: orderType === "delivery" ? form.address.trim() : null,
          delivery_fee: deliveryFee,
          subtotal,
          total,
          status: "en_attente",
          payment_method: "cash",
        })
        .select()
        .single();

      if (error) throw error;

      // Save order items
      await supabase.from("order_items").insert(
        items.map(i => ({
          order_id: order.id,
          dish_id: i.id,
          dish_name: i.name,
          quantity: i.qty,
          unit_price: i.price,
          total_price: i.price * i.qty,
        }))
      );

      // Generate WhatsApp message
      const typeLabel = orderType === "delivery" ? "🚚 Livraison" : "🏪 À emporter";
      const itemsList = items.map(i => `• ${i.name} ×${i.qty} — ${(i.price * i.qty).toLocaleString()} FCFA`).join("\n");
      const msg = [
        `🛒 *NOUVELLE COMMANDE*`,
        ``,
        `👤 *Client :* ${form.name}`,
        `📞 *Tél :* ${form.phone}`,
        `📦 *Type :* ${typeLabel}`,
        orderType === "delivery" ? `📍 *Zone :* ${selectedZone?.name}\n🏠 *Adresse :* ${form.address}` : "",
        ``,
        `*Articles :*`,
        itemsList,
        ``,
        `💰 *Sous-total :* ${subtotal.toLocaleString()} FCFA`,
        deliveryFee > 0 ? `🚚 *Livraison :* ${deliveryFee.toLocaleString()} FCFA` : "",
        `✅ *TOTAL : ${total.toLocaleString()} FCFA*`,
        ``,
        `💳 Paiement à la livraison`,
      ].filter(Boolean).join("\n");

      // Redirect to WhatsApp
      const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
      window.open(url, "_blank");

      toast.success("Commande envoyée ! 🎉");
      onClose();
    } catch {
      toast.error("Erreur lors de la commande");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-end md:items-center justify-center" onClick={onClose}>
      <div className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-100 p-4 flex items-center justify-between rounded-t-3xl">
          <h2 className="font-bold text-lg">
            {step === 1 ? "Votre commande" : step === 2 ? "Mode de retrait" : "Vos informations"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* STEP 1: Order summary */}
          {step === 1 && (
            <>
              <div className="space-y-3">
                {items.map(i => (
                  <div key={i.id} className="flex justify-between items-center text-sm">
                    <span>{i.name} <span className="text-gray-400">×{i.qty}</span></span>
                    <span className="font-semibold">{(i.price * i.qty).toLocaleString()} FCFA</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold">
                <span>Sous-total</span>
                <span style={{ color: brand }}>{subtotal.toLocaleString()} FCFA</span>
              </div>
              <button
                onClick={() => setStep(deliveryEnabled ? 2 : 3)}
                className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-transform active:scale-[0.97]"
                style={{ backgroundColor: brand }}
              >
                Continuer <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          {/* STEP 2: Delivery or pickup */}
          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setOrderType("pickup"); setSelectedZone(null); }}
                  className="p-4 rounded-xl border-2 text-center transition-all"
                  style={{ borderColor: orderType === "pickup" ? brand : "#e5e7eb" }}
                >
                  <ShoppingBag className="h-8 w-8 mx-auto mb-2" style={{ color: orderType === "pickup" ? brand : "#9ca3af" }} />
                  <p className="font-bold text-sm">À emporter</p>
                  <p className="text-xs text-gray-400 mt-1">Gratuit</p>
                </button>
                <button
                  onClick={() => setOrderType("delivery")}
                  className="p-4 rounded-xl border-2 text-center transition-all"
                  style={{ borderColor: orderType === "delivery" ? brand : "#e5e7eb" }}
                >
                  <Truck className="h-8 w-8 mx-auto mb-2" style={{ color: orderType === "delivery" ? brand : "#9ca3af" }} />
                  <p className="font-bold text-sm">Livraison</p>
                  <p className="text-xs text-gray-400 mt-1">Selon la zone</p>
                </button>
              </div>

              {orderType === "delivery" && zones.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Zone de livraison</Label>
                  {zones.map(z => (
                    <button
                      key={z.id}
                      onClick={() => setSelectedZone(z)}
                      className="w-full text-left p-3 rounded-xl border-2 transition-all flex items-center gap-3"
                      style={{ borderColor: selectedZone?.id === z.id ? brand : "#e5e7eb" }}
                    >
                      <MapPin className="h-4 w-4 flex-shrink-0" style={{ color: selectedZone?.id === z.id ? brand : "#9ca3af" }} />
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{z.name}</p>
                        <p className="text-xs text-gray-400">{z.neighborhoods}</p>
                      </div>
                      <span className="font-bold text-sm" style={{ color: brand }}>{Number(z.price).toLocaleString()} FCFA</span>
                    </button>
                  ))}
                </div>
              )}

              {orderType === "delivery" && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Adresse de livraison</Label>
                  <Input
                    placeholder="ex: Villa 12, Cité Keur Gorgui"
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              )}

              <div className="border-t border-gray-100 pt-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Sous-total</span><span>{subtotal.toLocaleString()} FCFA</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Livraison</span><span>{deliveryFee.toLocaleString()} FCFA</span>
                  </div>
                )}
                <div className="flex justify-between font-bold">
                  <span>Total</span><span style={{ color: brand }}>{total.toLocaleString()} FCFA</span>
                </div>
              </div>

              <button
                onClick={() => setStep(3)}
                className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-transform active:scale-[0.97]"
                style={{ backgroundColor: brand }}
              >
                Continuer <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          {/* STEP 3: Customer info */}
          {step === 3 && (
            <>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Votre nom</Label>
                  <Input placeholder="ex: Moussa Diop" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Téléphone</Label>
                  <Input placeholder="ex: 77 123 45 67" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="rounded-xl" />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{orderType === "delivery" ? "Livraison" : "À emporter"}</span>
                  <span>{deliveryFee > 0 ? `${deliveryFee.toLocaleString()} FCFA` : "Gratuit"}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span><span style={{ color: brand }}>{total.toLocaleString()} FCFA</span>
                </div>
                <p className="text-xs text-gray-400">💳 Paiement à la livraison</p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-transform active:scale-[0.97] disabled:opacity-60"
                style={{ backgroundColor: brand }}
              >
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Confirmer la commande</>}
              </button>
            </>
          )}

          {/* Back button */}
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="w-full text-center text-sm text-gray-400 py-2">
              ← Retour
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
