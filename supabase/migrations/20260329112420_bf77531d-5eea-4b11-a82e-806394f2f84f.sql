
-- Delivery zones table
CREATE TABLE public.delivery_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  neighborhoods TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage delivery zones" ON public.delivery_zones
  FOR ALL USING (EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = delivery_zones.restaurant_id AND restaurants.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = delivery_zones.restaurant_id AND restaurants.user_id = auth.uid()));

CREATE POLICY "Public can view delivery zones" ON public.delivery_zones
  FOR SELECT USING (EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = delivery_zones.restaurant_id AND restaurants.is_published = true));

-- Add delivery_enabled to restaurants
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS delivery_enabled BOOLEAN DEFAULT false;

-- Orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  order_type TEXT NOT NULL DEFAULT 'pickup' CHECK (order_type IN ('delivery', 'pickup')),
  delivery_zone_id UUID REFERENCES public.delivery_zones(id),
  delivery_address TEXT,
  delivery_fee INTEGER NOT NULL DEFAULT 0,
  subtotal INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'en_attente' CHECK (status IN ('en_attente', 'acceptee', 'en_preparation', 'prete', 'livree', 'annulee')),
  payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage orders" ON public.orders
  FOR ALL USING (EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = orders.restaurant_id AND restaurants.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = orders.restaurant_id AND restaurants.user_id = auth.uid()));

CREATE POLICY "Anyone can create orders" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view own order" ON public.orders
  FOR SELECT USING (true);

-- Order items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  dish_id UUID REFERENCES public.dishes(id),
  dish_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL DEFAULT 0,
  total_price INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage order items" ON public.order_items
  FOR ALL USING (EXISTS (SELECT 1 FROM orders JOIN restaurants ON restaurants.id = orders.restaurant_id WHERE orders.id = order_items.order_id AND restaurants.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM orders JOIN restaurants ON restaurants.id = orders.restaurant_id WHERE orders.id = order_items.order_id AND restaurants.user_id = auth.uid()));

CREATE POLICY "Anyone can create order items" ON public.order_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view order items" ON public.order_items
  FOR SELECT USING (true);

-- Reservations table
CREATE TABLE public.reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  party_size INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'en_attente' CHECK (status IN ('en_attente', 'acceptee', 'refusee')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage reservations" ON public.reservations
  FOR ALL USING (EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = reservations.restaurant_id AND restaurants.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = reservations.restaurant_id AND restaurants.user_id = auth.uid()));

CREATE POLICY "Anyone can create reservations" ON public.reservations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view own reservation" ON public.reservations
  FOR SELECT USING (true);

-- Add updated_at trigger to orders
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
