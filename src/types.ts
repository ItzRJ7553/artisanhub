export type UserRole = 'customer' | 'creator' | 'admin';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  instagram_handle?: string;
  creator_profile?: CreatorProfile;
  created_at: string;
}

export interface CreatorProfile {
  id: string;
  user_id: string;
  store_name: string;
  slug: string;
  logo_url?: string;
  banner_url?: string;
  headline?: string;
  bio?: string;
  category: string;
  contact_email?: string;
  phone?: string;
  instagram_handle?: string;
  store_address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  shipping_policy?: string;
  return_policy?: string;
  status: 'active' | 'pending' | 'suspended';
  created_at: string;
  updated_at?: string;

  // Computed ranking & stats
  rank_score?: number;
  avg_rating?: number;
  total_reviews?: number;
  completed_orders?: number;
  product_count?: number;
  featured_products?: Product[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  display_order: number;
  is_primary: boolean;
}

export interface Product {
  id: string;
  creator_id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  compare_price?: number;
  stock: number;
  category: string;
  tags?: string[];
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at?: string;

  // Joined fields
  primary_image?: string;
  images?: ProductImage[];
  creator?: CreatorProfile;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_title: string;
  product_image?: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  creator_id: string;
  total_amount: number;
  subtotal: number;
  shipping_fee: number;
  status: OrderStatus;
  customer_name: string;
  customer_phone?: string; // Strictly protected PII
  delivery_address?: string; // Strictly protected PII
  delivery_city?: string; // Strictly protected PII
  delivery_state?: string; // Strictly protected PII
  delivery_postal?: string; // Strictly protected PII
  delivery_notes?: string;
  tracking_number?: string;
  created_at: string;
  updated_at?: string;

  // Joined
  items?: OrderItem[];
  creator?: CreatorProfile;
  customer?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface Review {
  id: string;
  creator_id: string;
  product_id?: string;
  customer_id: string;
  order_id?: string;
  rating: number;
  review_text: string;
  customer_display_name: string;
  customer_avatar?: string;
  is_verified_purchase: boolean;
  creator_reply?: string;
  creator_reply_at?: string;
  created_at: string;
  product_title?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CreatorRankingData {
  creator_id: string;
  score: number;
  bayesian_rating: number;
  avg_rating: number;
  total_reviews: number;
  completed_orders: number;
  product_count: number;
  activity_score: number;
  last_calculated_at: string;
}

export type StoreCategory =
  | 'All'
  | 'Ceramics & Pottery'
  | 'Textiles & Knits'
  | 'Botanical Skincare'
  | 'Art & Prints'
  | 'Leather Goods'
  | 'Candles & Scents'
  | 'Woodcraft & Carvings'
  | 'Jewelry & Metals';
