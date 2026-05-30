import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionState {
  loading: boolean;
  trialDaysLeft: number;
  isTrialActive: boolean;
  isSubscribed: boolean;
  subscriptionDaysLeft: number;
  hasAccess: boolean;
  subscription: any | null;
}

export const useSubscription = (restaurant: any) => {
  const [state, setState] = useState<SubscriptionState>({
    loading: true,
    trialDaysLeft: 0,
    isTrialActive: false,
    isSubscribed: false,
    subscriptionDaysLeft: 0,
    hasAccess: false,
    subscription: null,
  });

  useEffect(() => {
    if (!restaurant) {
      setState(s => ({ ...s, loading: false }));
      return;
    }

    const checkAccess = async () => {
      const now = new Date();

      // Calcul jours essai
      const trialEnd = new Date(restaurant.trial_ends_at);
      const diffTrial = trialEnd.getTime() - now.getTime();
      const trialDaysLeft = Math.max(0, Math.ceil(diffTrial / (1000 * 60 * 60 * 24)));
      const isTrialActive = trialDaysLeft > 0;

      // Vérifier abonnement
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .maybeSingle();

      const isSubscribed = sub?.status === "active" && new Date(sub.expires_at) > now;

      // Calcul jours restants abonnement
      let subscriptionDaysLeft = 0;
      if (isSubscribed && sub?.expires_at) {
        const diffSub = new Date(sub.expires_at).getTime() - now.getTime();
        subscriptionDaysLeft = Math.max(0, Math.ceil(diffSub / (1000 * 60 * 60 * 24)));
      }

      setState({
        loading: false,
        trialDaysLeft,
        isTrialActive,
        isSubscribed,
        subscriptionDaysLeft,
        hasAccess: isTrialActive || isSubscribed,
        subscription: sub,
      });
    };

    checkAccess();
  }, [restaurant]);

  return state;
};