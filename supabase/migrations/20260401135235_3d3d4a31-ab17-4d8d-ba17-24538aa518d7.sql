
-- Add trial_ends_at to restaurants
ALTER TABLE public.restaurants 
ADD COLUMN trial_ends_at timestamp with time zone DEFAULT (now() + interval '15 days');

-- Update existing restaurants to have trial starting now
UPDATE public.restaurants SET trial_ends_at = now() + interval '15 days' WHERE trial_ends_at IS NULL;

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active',
  plan_name text NOT NULL DEFAULT 'pro',
  price integer NOT NULL DEFAULT 6600,
  starts_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '30 days'),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(restaurant_id)
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Owner can view their subscription
CREATE POLICY "Owners can view subscription" ON public.subscriptions
FOR SELECT TO public
USING (EXISTS (
  SELECT 1 FROM restaurants WHERE restaurants.id = subscriptions.restaurant_id AND restaurants.user_id = auth.uid()
));

-- Owner can manage their subscription
CREATE POLICY "Owners manage subscription" ON public.subscriptions
FOR ALL TO public
USING (EXISTS (
  SELECT 1 FROM restaurants WHERE restaurants.id = subscriptions.restaurant_id AND restaurants.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM restaurants WHERE restaurants.id = subscriptions.restaurant_id AND restaurants.user_id = auth.uid()
));

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Admins can manage all subscriptions
CREATE POLICY "Admins manage all subscriptions" ON public.subscriptions
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));
