import { User, CreatorProfile, Product, Order, Review, CreatorRankingData } from '../types.ts';

const TOKEN_KEY = 'artisanhub_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  let data: any;

  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Server returned HTTP ${response.status} (${response.statusText || 'Non-JSON response'})`);
    }
  }

  if (!response.ok || data.success === false) {
    throw new Error(data.error || 'An error occurred with the request');
  }

  return data;
}

export const api = {
  // Auth
  async register(data: { email: string; password: string; full_name: string; role?: string }) {
    const res = await request<{ success: boolean; user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.token) setAuthToken(res.token);
    return res;
  },

  async login(data: { email: string; password: string }) {
    const res = await request<{ success: boolean; user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.token) setAuthToken(res.token);
    return res;
  },

  async getMe() {
    return request<{ success: boolean; user: User | null }>('/api/auth/me');
  },

  async logout() {
    clearAuthToken();
    return request<{ success: boolean; message: string }>('/api/auth/logout', { method: 'POST' });
  },

  async resetPassword(data: { email: string; new_password: string }) {
    return request<{ success: boolean; message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Creators
  async getCreators(params?: { category?: string; search?: string; sort?: string }) {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.sort) query.set('sort', params.sort);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<{ success: boolean; creators: CreatorProfile[] }>(`/api/creators${qs}`);
  },

  async getCreatorBySlug(slug: string) {
    return request<{
      success: boolean;
      creator: CreatorProfile;
      products: Product[];
      reviews: Review[];
    }>(`/api/creators/${slug}`);
  },

  async registerCreator(data: Partial<CreatorProfile>) {
    return request<{ success: boolean; creator: CreatorProfile; message: string }>('/api/creators/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCreatorProfile(data: Partial<CreatorProfile>) {
    return request<{ success: boolean; creator: CreatorProfile }>('/api/creators/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getCreatorDashboardStats() {
    return request<{
      success: boolean;
      stats: {
        totalRevenue: number;
        totalOrders: number;
        pendingOrdersCount: number;
        completedOrdersCount: number;
        productCount: number;
        inStockProductCount: number;
        reviewCount: number;
        avgRating: number;
        rankScore: number;
      };
    }>('/api/creators/dashboard/stats');
  },

  // Products
  async getProducts(params?: { category?: string; search?: string; creatorId?: string; isFeatured?: boolean }) {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.creatorId) query.set('creatorId', params.creatorId);
    if (params?.isFeatured !== undefined) query.set('isFeatured', String(params.isFeatured));
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<{ success: boolean; products: Product[] }>(`/api/products${qs}`);
  },

  async getProductById(id: string) {
    return request<{ success: boolean; product: Product; reviews: Review[] }>(`/api/products/${id}`);
  },

  async createProduct(data: {
    title: string;
    description: string;
    price: number;
    compare_price?: number;
    stock: number;
    category: string;
    tags?: string[];
    images?: string[];
  }) {
    return request<{ success: boolean; product: Product }>('/api/creator/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateProduct(id: string, data: Partial<Product> & { images?: string[] }) {
    return request<{ success: boolean; product: Product }>(`/api/creator/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteProduct(id: string) {
    return request<{ success: boolean; message: string }>(`/api/creator/products/${id}`, {
      method: 'DELETE',
    });
  },

  // Orders
  async createOrder(data: {
    items: { productId: string; quantity: number }[];
    customer_name: string;
    customer_phone: string;
    delivery_address: string;
    delivery_city: string;
    delivery_state: string;
    delivery_postal: string;
    delivery_notes?: string;
  }) {
    return request<{ success: boolean; orders: Order[]; message: string }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMyOrders() {
    return request<{ success: boolean; orders: Order[] }>('/api/orders/my-orders');
  },

  async getCreatorOrders() {
    return request<{ success: boolean; orders: Order[] }>('/api/orders/creator-orders');
  },

  async updateOrderStatus(orderId: string, status: string, tracking_number?: string) {
    return request<{ success: boolean; order: Order }>(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, tracking_number }),
    });
  },

  // Reviews
  async submitReview(data: {
    creator_id: string;
    product_id?: string;
    order_id?: string;
    rating: number;
    review_text: string;
  }) {
    return request<{ success: boolean; review: Review; message: string }>('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async replyToReview(reviewId: string, reply: string) {
    return request<{ success: boolean; review: Review }>(`/api/reviews/${reviewId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ reply }),
    });
  },

  // Asset Upload
  async uploadImage(imageBase64: string, filename?: string) {
    return request<{ success: boolean; url: string; key: string }>('/api/upload', {
      method: 'POST',
      body: JSON.stringify({ imageBase64, filename }),
    });
  },

  // Ranking recalculation
  async recalculateRankings() {
    return request<{ success: boolean; rankings: CreatorRankingData[]; message: string }>('/api/ranking/recalculate', {
      method: 'POST',
    });
  },
};
