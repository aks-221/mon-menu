import { supabase } from "@/integrations/supabase/client";

// Generate a URL-safe slug from restaurant name
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

// Create a restaurant after signup
export const createRestaurant = async (
  userId: string,
  data: { name: string; cuisineType: string; whatsapp: string }
) => {
  let slug = generateSlug(data.name);
  
  // Ensure slug is unique
  const { data: existing } = await supabase
    .from("restaurants")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle();
  
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const { data: restaurant, error } = await supabase
    .from("restaurants")
    .insert({
      user_id: userId,
      name: data.name,
      slug,
      cuisine_type: data.cuisineType,
      whatsapp: data.whatsapp,
      phone: data.whatsapp,
    })
    .select()
    .single();

  if (error) throw error;

  // Create default categories
  const defaultCategories = ["Entrées", "Plats", "Boissons", "Desserts"];
  await supabase.from("categories").insert(
    defaultCategories.map((name, i) => ({
      restaurant_id: restaurant.id,
      name,
      sort_order: i,
    }))
  );

  // Create default business hours (Mon-Sun)
  const defaultHours = Array.from({ length: 7 }, (_, i) => ({
    restaurant_id: restaurant.id,
    day_of_week: i,
    open_time: "08:00",
    close_time: i >= 5 ? "23:00" : "22:00",
    is_closed: false,
  }));
  await supabase.from("business_hours").insert(defaultHours);

  return restaurant;
};

// Fetch user's restaurant
export const fetchUserRestaurant = async (userId: string) => {
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
};

// Fetch public restaurant by slug
export const fetchRestaurantBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw error;
  return data;
};

// Fetch categories for a restaurant
export const fetchCategories = async (restaurantId: string) => {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("sort_order");
  if (error) throw error;
  return data || [];
};

// Fetch dishes for a restaurant
export const fetchDishes = async (restaurantId: string) => {
  const { data, error } = await supabase
    .from("dishes")
    .select("*, categories(name)")
    .eq("restaurant_id", restaurantId)
    .order("sort_order");
  if (error) throw error;
  return data || [];
};

// Fetch business hours
export const fetchBusinessHours = async (restaurantId: string) => {
  const { data, error } = await supabase
    .from("business_hours")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("day_of_week");
  if (error) throw error;
  return data || [];
};

// Update restaurant profile
export const updateRestaurant = async (id: string, updates: Record<string, unknown>) => {
  const { error } = await supabase
    .from("restaurants")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
};

// Add a dish
export const addDish = async (dish: {
  restaurant_id: string;
  category_id: string | null;
  name: string;
  description: string;
  price: number;
  tags: string[];
}) => {
  const { data, error } = await supabase
    .from("dishes")
    .insert(dish)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Update a dish
export const updateDish = async (id: string, updates: Record<string, unknown>) => {
  const { error } = await supabase
    .from("dishes")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
};

// Delete a dish
export const deleteDishById = async (id: string) => {
  const { error } = await supabase.from("dishes").delete().eq("id", id);
  if (error) throw error;
};

// Update business hours
export const updateBusinessHours = async (
  restaurantId: string,
  hours: { day_of_week: number; open_time: string; close_time: string; is_closed: boolean }[]
) => {
  // Upsert all hours
  const { error } = await supabase
    .from("business_hours")
    .upsert(
      hours.map((h) => ({ ...h, restaurant_id: restaurantId })),
      { onConflict: "restaurant_id,day_of_week" }
    );
  if (error) throw error;
};

// Add a category
export const addCategory = async (restaurantId: string, name: string) => {
  const { data, error } = await supabase
    .from("categories")
    .insert({ restaurant_id: restaurantId, name })
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Delete a category
export const deleteCategoryById = async (id: string) => {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
};
