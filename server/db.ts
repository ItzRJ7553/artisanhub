/**
 * In-Memory & Cloudflare D1 Compatible SQLite Database Layer
 * Implements schema tables, seed data, relation management, and strict query filters
 */

import fs from 'fs';
import path from 'path';
import { calculateCreatorRankingScore } from './ranking.js';

const DB_FILE = path.join(process.cwd(), 'data', 'db.json');

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: 'customer' | 'creator' | 'admin';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatorProfileRow {
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
  updated_at: string;
}

export interface ProductRow {
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
  updated_at: string;
}

export interface ProductImageRow {
  id: string;
  product_id: string;
  image_url: string;
  display_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface OrderRow {
  id: string;
  order_number: string;
  customer_id: string;
  creator_id: string;
  total_amount: number;
  subtotal: number;
  shipping_fee: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  customer_name: string;
  customer_phone: string; // STRICT PRIVACY
  delivery_address: string; // STRICT PRIVACY
  delivery_city: string; // STRICT PRIVACY
  delivery_state: string; // STRICT PRIVACY
  delivery_postal: string; // STRICT PRIVACY
  delivery_notes?: string;
  tracking_number?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string;
  product_title: string;
  product_image?: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface ReviewRow {
  id: string;
  creator_id: string;
  product_id?: string;
  customer_id: string;
  order_id?: string;
  rating: number;
  review_text: string;
  customer_display_name: string;
  is_verified_purchase: boolean;
  creator_reply?: string;
  creator_reply_at?: string;
  created_at: string;
}

export interface CreatorRankingRow {
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

// In-Memory Cloudflare D1 Store
class DatabaseStore {
  users: UserRow[] = [];
  creators: CreatorProfileRow[] = [];
  products: ProductRow[] = [];
  productImages: ProductImageRow[] = [];
  orders: OrderRow[] = [];
  orderItems: OrderItemRow[] = [];
  reviews: ReviewRow[] = [];
  rankings: CreatorRankingRow[] = [];

  constructor() {
    const loaded = this.load();
    if (!loaded) {
      this.seedDatabase();
    }
    this.recalculateAllRankings();
  }

  load(): boolean {
    try {
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        const data = JSON.parse(content);
        this.users = data.users || [];
        this.creators = data.creators || [];
        this.products = data.products || [];
        this.productImages = data.productImages || [];
        this.orders = data.orders || [];
        this.orderItems = data.orderItems || [];
        this.reviews = data.reviews || [];
        return true;
      }
    } catch (err) {
      console.error('Error reading persistent database:', err);
    }
    return false;
  }

  save() {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const data = {
        users: this.users,
        creators: this.creators,
        products: this.products,
        productImages: this.productImages,
        orders: this.orders,
        orderItems: this.orderItems,
        reviews: this.reviews,
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing persistent database:', err);
    }
  }

  seedDatabase() {
    this.users = [];
    this.creators = [];
    this.products = [];
    this.productImages = [];
    this.orders = [];
    this.orderItems = [];
    this.reviews = [];
  }

  // Recalculate multi-factor rankings for all creators
  recalculateAllRankings() {
    this.rankings = this.creators.map(creator => {
      const creatorReviews = this.reviews.filter(r => r.creator_id === creator.id);
      const creatorOrders = this.orders.filter(o => o.creator_id === creator.id && o.status === 'delivered');
      const creatorProducts = this.products.filter(p => p.creator_id === creator.id && p.is_active);

      const totalReviews = creatorReviews.length;
      const sumRating = creatorReviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = totalReviews > 0 ? Math.round((sumRating / totalReviews) * 10) / 10 : 0;

      // Calculate days since created & last order
      const daysSinceCreated = Math.max(1, Math.floor((Date.now() - new Date(creator.created_at).getTime()) / (1000 * 60 * 60 * 24)));
      const lastOrder = this.orders
        .filter(o => o.creator_id === creator.id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
      const daysSinceLastOrder = lastOrder
        ? Math.max(0, Math.floor((Date.now() - new Date(lastOrder.created_at).getTime()) / (1000 * 60 * 60 * 24)))
        : daysSinceCreated;

      const rankingResult = calculateCreatorRankingScore({
        creator_id: creator.id,
        avg_rating: avgRating,
        total_reviews: totalReviews,
        completed_orders: creatorOrders.length,
        product_count: creatorProducts.length,
        days_since_last_order: daysSinceLastOrder,
        days_since_created: daysSinceCreated,
      });

      return {
        creator_id: creator.id,
        score: rankingResult.score,
        bayesian_rating: rankingResult.bayesianRating,
        avg_rating: avgRating,
        total_reviews: totalReviews,
        completed_orders: creatorOrders.length,
        product_count: creatorProducts.length,
        activity_score: rankingResult.activityScore,
        last_calculated_at: new Date().toISOString(),
      };
    });

    // Automatically persist changes to disk
    this.save();
  }

  // --- QUERY METHODS ---

  getCreatorById(creatorId: string, includePreviewProducts = true) {
    const creator = this.creators.find(c => c.id === creatorId);
    if (!creator) return null;
    const ranking = this.rankings.find(r => r.creator_id === creator.id);
    
    // Attach preview products safely without circular recursion
    let creatorProducts: any[] = [];
    if (includePreviewProducts) {
      creatorProducts = this.products
        .filter(p => p.creator_id === creator.id && p.is_active)
        .slice(0, 4)
        .map(p => {
          const images = this.productImages
            .filter(img => img.product_id === p.id)
            .sort((a, b) => a.display_order - b.display_order);
          return {
            ...p,
            primary_image: images.find(img => img.is_primary)?.image_url || images[0]?.image_url || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
            images,
          };
        });
    }

    return {
      ...creator,
      rank_score: ranking?.score || 0,
      avg_rating: ranking?.avg_rating || 0,
      total_reviews: ranking?.total_reviews || 0,
      completed_orders: ranking?.completed_orders || 0,
      product_count: ranking?.product_count || 0,
      featured_products: creatorProducts,
    };
  }

  getCreatorBySlug(slug: string) {
    const creator = this.creators.find(c => c.slug === slug);
    if (!creator) return null;
    return this.getCreatorById(creator.id, true);
  }

  getCreatorByUserId(userId: string) {
    const creator = this.creators.find(c => c.user_id === userId);
    if (!creator) return null;
    return this.getCreatorById(creator.id, true);
  }

  getCreators(filter?: { category?: string; search?: string; sort?: string }) {
    let list = this.creators
      .filter(c => c.status === 'active')
      .map(c => this.getCreatorById(c.id, true)!);

    if (filter?.category && filter.category !== 'All') {
      list = list.filter(c => c.category.toLowerCase() === filter.category!.toLowerCase());
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(c =>
        c.store_name.toLowerCase().includes(q) ||
        (c.headline && c.headline.toLowerCase().includes(q)) ||
        (c.bio && c.bio.toLowerCase().includes(q)) ||
        (c.city && c.city.toLowerCase().includes(q)) ||
        (c.category && c.category.toLowerCase().includes(q))
      );
    }

    if (filter?.sort === 'rating') {
      list.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0) || (b.total_reviews || 0) - (a.total_reviews || 0));
    } else if (filter?.sort === 'orders') {
      list.sort((a, b) => (b.completed_orders || 0) - (a.completed_orders || 0));
    } else if (filter?.sort === 'newest') {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      // Default: Multi-factor composite ranking score
      list.sort((a, b) => (b.rank_score || 0) - (a.rank_score || 0));
    }

    return list;
  }

  getProductById(productId: string, includeCreator = true) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return null;
    const images = this.productImages
      .filter(img => img.product_id === product.id)
      .sort((a, b) => a.display_order - b.display_order);
    
    // Non-recursive creator lookup
    const creator = includeCreator ? this.getCreatorById(product.creator_id, false) : undefined;
    
    return {
      ...product,
      primary_image: images.find(img => img.is_primary)?.image_url || images[0]?.image_url || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
      images,
      creator: creator || undefined,
    };
  }

  getProducts(filter?: { category?: string; search?: string; creatorId?: string; isFeatured?: boolean }) {
    let list = this.products.filter(p => p.is_active);

    if (filter?.creatorId) {
      list = list.filter(p => p.creator_id === filter.creatorId);
    }
    if (filter?.category && filter.category !== 'All') {
      list = list.filter(p => p.category.toLowerCase() === filter.category!.toLowerCase());
    }
    if (filter?.isFeatured !== undefined) {
      list = list.filter(p => p.is_featured === filter.isFeatured);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    return list.map(p => this.getProductById(p.id, true)!);
  }

  // STRICT PRIVACY: Orders must sanitize customer PII unless requester is the customer, fulfilling creator, or admin
  sanitizeOrder(order: OrderRow, requesterUserId?: string, requesterRole?: string): any {
    const isCustomer = requesterUserId && order.customer_id === requesterUserId;
    const creator = this.creators.find(c => c.id === order.creator_id);
    const isFulfillingCreator = requesterUserId && creator && creator.user_id === requesterUserId;
    const isAdmin = requesterRole === 'admin';

    const items = this.orderItems.filter(item => item.order_id === order.id);
    const creatorInfo = this.getCreatorById(order.creator_id, false);

    if (isCustomer || isFulfillingCreator || isAdmin) {
      return {
        ...order,
        items,
        creator: creatorInfo,
      };
    }

    // SANITIZE PII for any other viewer
    return {
      id: order.id,
      order_number: order.order_number,
      creator_id: order.creator_id,
      total_amount: order.total_amount,
      subtotal: order.subtotal,
      shipping_fee: order.shipping_fee,
      status: order.status,
      created_at: order.created_at,
      updated_at: order.updated_at,
      items,
      creator: creatorInfo,
      // Customer personal delivery details completely omitted
    };
  }

  getCustomerOrders(customerId: string) {
    return this.orders
      .filter(o => o.customer_id === customerId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map(o => this.sanitizeOrder(o, customerId));
  }

  getCreatorOrders(creatorId: string, creatorUserId: string) {
    return this.orders
      .filter(o => o.creator_id === creatorId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map(o => this.sanitizeOrder(o, creatorUserId));
  }
}

export const db = new DatabaseStore();
