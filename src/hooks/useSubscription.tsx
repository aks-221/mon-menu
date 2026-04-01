import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionState {
  loading: boolean;
  trialDaysLeft: number;
  isTrialActive: boolean;
  isSubscribed: boolean;
  hasAccess: boolean;
  subscription: any | null;
}

export const useSubscription = (restaurant: any) => {
  const [state, setState] = useState<SubscriptionState>({
    loading: true,
    trialDaysLeft: 0,
    isTrialActive: false,
    isSubscribed: false,
    hasAccess: false,
    subscription: null,
  });

  useEffect(() => {
    if (!restaurant) {
      setState(s => ({ ...s, loading: false }));
      return;
    }

    const checkAccess = async () => {
      // Calculate trial days
      const trialEnd = new Date(restaurant.trial_ends_at);
      const now = new Date();
      const diffMs = trialEnd.getTime() - now.getTime();
      const trialDaysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      const isTrialActive = trialDaysLeft > 0;

      // Check subscription
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .maybeSingle();

      const isSubscribed = sub?.status === "active" && new Date(sub.expires_at) > now;

      setState({
        loading: false,
        trialDaysLeft,
        isTrialActive,
        isSubscribed,
        hasAccess: isTrialActive || isSubscribed,
        subscription: sub,
      });
    };

    checkAccess();
  }, [restaurant]);

  return state;
};
