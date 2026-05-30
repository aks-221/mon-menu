import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Gérer les requêtes CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { restaurant_id, restaurant_name, amount, reference, payment_method } = await req.json();

    // Vérifier les données reçues
    if (!restaurant_id || !amount || !reference || !payment_method) {
      return new Response(
        JSON.stringify({ error: "Données manquantes" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const SENEPAY_SECRET_KEY = Deno.env.get("SENEPAY_SECRET_KEY");
    const APP_URL = Deno.env.get("APP_URL") || "https://samamenu.com";
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");

    // Appel API SenePay
    const response = await fetch("https://api.sene-pay.com/v1/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SENEPAY_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency: "XOF",
        description: `Abonnement SamaMenu Pro - 1 mois`,
        reference,
        success_url: `${APP_URL}/dashboard?payment=success`,
        cancel_url: `${APP_URL}/dashboard?payment=cancel`,
        webhook_url: `${SUPABASE_URL}/functions/v1/senepay-webhook`,
        customer: {
          name: restaurant_name,
        },
        payment_methods: [payment_method],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erreur SenePay:", data);
      return new Response(
        JSON.stringify({ error: "Erreur SenePay", details: data }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Retourner l'URL de paiement
    return new Response(
      JSON.stringify({
        payment_url: data.payment_url || data.url || data.checkout_url,
        payment_id: data.id || data.payment_id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Erreur serveur:", err);
    return new Response(
      JSON.stringify({ error: "Erreur serveur inattendue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});