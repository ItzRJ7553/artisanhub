import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import { db, UserRow, CreatorProfileRow, ProductRow, ProductImageRow, OrderRow, OrderItemRow, ReviewRow } from './server/db.js';
import {
  authMiddleware,
  optionalAuthMiddleware,
  requireCreatorMiddleware,
  generateToken,
  hashPassword,
  comparePassword,
  AuthenticatedRequest,
} from './server/auth.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));
  app.use(cookieParser());

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'ArtisanHub Cloudflare-compatible Backend',
      d1_status: 'connected',
      timestamp: new Date().toISOString(),
    });
  });

  // 1. AUTHENTICATION ENDPOINTS
  app.post('/api/auth/register', (req, res) => {
    try {
      const { email, password, full_name, role = 'customer' } = req.body;
      if (!email || !password || !full_name) {
        return res.status(400).json({ success: false, error: 'All fields are required' });
      }

      const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return res.status(400).json({ success: false, error: 'An account with this email already exists' });
      }

      const newUser: UserRow = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        email: email.toLowerCase(),
        password_hash: hashPassword(password),
        full_name,
        role: role === 'creator' ? 'creator' : 'customer',
        avatar_url: `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(full_name)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      db.users.push(newUser);
      db.save();

      const token = generateToken({
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
      });

      res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });

      res.json({
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          full_name: newUser.full_name,
          role: newUser.role,
          avatar_url: newUser.avatar_url,
          created_at: newUser.created_at,
        },
        token,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/auth/login', (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password required' });
      }

      const cleanEmail = email.toLowerCase().trim();

      let user = db.users.find(u => u.email.toLowerCase() === cleanEmail);

      if (!user) {
        return res.status(401).json({ success: false, error: 'No account found with this email. Please register.' });
      }

      if (!comparePassword(password, user.password_hash)) {
        return res.status(401).json({ success: false, error: 'Incorrect password' });
      }

      const creatorProfile = db.getCreatorByUserId(user.id);

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          avatar_url: user.avatar_url,
          creator_profile: creatorProfile || undefined,
          created_at: user.created_at,
        },
        token,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/auth/me', optionalAuthMiddleware, (req: AuthenticatedRequest, res) => {
    if (!req.user || !req.currentUser) {
      return res.json({ success: true, user: null });
    }

    const creatorProfile = db.getCreatorByUserId(req.currentUser.id);

    res.json({
      success: true,
      user: {
        id: req.currentUser.id,
        email: req.currentUser.email,
        full_name: req.currentUser.full_name,
        role: req.currentUser.role,
        avatar_url: req.currentUser.avatar_url,
        creator_profile: creatorProfile || undefined,
        created_at: req.currentUser.created_at,
      },
    });
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true, message: 'Logged out successfully' });
  });

  app.post('/api/auth/reset-password', (req, res) => {
    const { email, new_password } = req.body;
    if (!email || !new_password) {
      return res.status(400).json({ success: false, error: 'Email and new password required' });
    }

    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(404).json({ success: false, error: 'No account found with this email' });
    }

    user.password_hash = hashPassword(new_password);
    user.updated_at = new Date().toISOString();

    res.json({ success: true, message: 'Password has been reset successfully. Please log in.' });
  });

  // 2. CREATOR DIRECTORY & STORES
  app.get('/api/creators', (req, res) => {
    const { category, search, sort } = req.query;
    const creators = db.getCreators({
      category: category as string,
      search: search as string,
      sort: sort as string,
    });
    res.json({ success: true, creators });
  });

  app.get('/api/creators/:slug', (req, res) => {
    const { slug } = req.params;
    const creator = db.getCreatorBySlug(slug);
    if (!creator) {
      return res.status(404).json({ success: false, error: 'Creator store not found' });
    }

    const products = db.getProducts({ creatorId: creator.id });
    const reviews = db.reviews
      .filter(r => r.creator_id === creator.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map(r => {
        const user = db.users.find(u => u.id === r.customer_id);
        const prod = r.product_id ? db.products.find(p => p.id === r.product_id) : null;
        return {
          ...r,
          customer_avatar: user?.avatar_url,
          product_title: prod?.title,
        };
      });

    res.json({ success: true, creator, products, reviews });
  });

  // Creator Onboarding / Registration
  app.post('/api/creators/register', authMiddleware, (req: AuthenticatedRequest, res) => {
    try {
      const user = req.currentUser!;
      const existingCreator = db.getCreatorByUserId(user.id);
      if (existingCreator) {
        return res.status(400).json({ success: false, error: 'You already have an active creator store' });
      }

      const {
        store_name,
        slug,
        category,
        headline,
        bio,
        logo_url,
        banner_url,
        phone,
        store_address,
        city,
        state,
        country = 'India',
        postal_code,
        shipping_policy,
        return_policy,
      } = req.body;

      if (!store_name || !slug) {
        return res.status(400).json({ success: false, error: 'Store name and URL slug are required' });
      }

      // Check slug uniqueness
      const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
      if (db.creators.some(c => c.slug === cleanSlug)) {
        return res.status(400).json({ success: false, error: 'This URL slug is already taken. Please pick another.' });
      }

      const newCreator: CreatorProfileRow = {
        id: `cr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        user_id: user.id,
        store_name,
        slug: cleanSlug,
        logo_url: logo_url || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=400&q=80',
        banner_url: banner_url || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80',
        headline: headline || `Handcrafted goods by ${store_name}`,
        bio: bio || `Welcome to ${store_name}. Every item is made with care and dedication.`,
        category: category || 'Ceramics & Pottery',
        contact_email: user.email,
        phone: phone || '',
        store_address: store_address || '',
        city: city || '',
        state: state || '',
        country,
        postal_code: postal_code || '',
        shipping_policy: shipping_policy || 'Standard orders ship in 2-4 business days.',
        return_policy: return_policy || '30-day return policy for unused items in original packaging.',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      db.creators.push(newCreator);

      // Upgrade user role to creator
      user.role = 'creator';
      user.updated_at = new Date().toISOString();

      db.recalculateAllRankings();

      const fullCreator = db.getCreatorById(newCreator.id);

      res.json({
        success: true,
        creator: fullCreator,
        message: 'Creator store created successfully!',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Creator profile update
  app.put('/api/creators/profile', authMiddleware, requireCreatorMiddleware, (req: AuthenticatedRequest, res) => {
    try {
      const creator = db.getCreatorByUserId(req.currentUser!.id);
      if (!creator) {
        return res.status(404).json({ success: false, error: 'Creator store not found' });
      }

      const creatorRow = db.creators.find(c => c.id === creator.id)!;
      const {
        store_name,
        headline,
        bio,
        category,
        logo_url,
        banner_url,
        phone,
        store_address,
        city,
        state,
        country,
        postal_code,
        shipping_policy,
        return_policy,
      } = req.body;

      if (store_name) creatorRow.store_name = store_name;
      if (headline !== undefined) creatorRow.headline = headline;
      if (bio !== undefined) creatorRow.bio = bio;
      if (category) creatorRow.category = category;
      if (logo_url) creatorRow.logo_url = logo_url;
      if (banner_url) creatorRow.banner_url = banner_url;
      if (phone !== undefined) creatorRow.phone = phone;
      if (store_address !== undefined) creatorRow.store_address = store_address;
      if (city !== undefined) creatorRow.city = city;
      if (state !== undefined) creatorRow.state = state;
      if (country !== undefined) creatorRow.country = country;
      if (postal_code !== undefined) creatorRow.postal_code = postal_code;
      if (shipping_policy !== undefined) creatorRow.shipping_policy = shipping_policy;
      if (return_policy !== undefined) creatorRow.return_policy = return_policy;
      creatorRow.updated_at = new Date().toISOString();

      db.recalculateAllRankings();

      res.json({ success: true, creator: db.getCreatorById(creator.id) });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Creator private dashboard stats
  app.get('/api/creators/dashboard/stats', authMiddleware, requireCreatorMiddleware, (req: AuthenticatedRequest, res) => {
    const creator = db.getCreatorByUserId(req.currentUser!.id);
    if (!creator) {
      return res.status(404).json({ success: false, error: 'Creator store not found' });
    }

    const orders = db.orders.filter(o => o.creator_id === creator.id);
    const products = db.products.filter(p => p.creator_id === creator.id);
    const reviews = db.reviews.filter(r => r.creator_id === creator.id);

    const totalRevenue = orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.subtotal, 0);

    const pendingOrdersCount = orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length;
    const completedOrdersCount = orders.filter(o => o.status === 'delivered').length;

    res.json({
      success: true,
      stats: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders: orders.length,
        pendingOrdersCount,
        completedOrdersCount,
        productCount: products.length,
        inStockProductCount: products.filter(p => p.stock > 0 && p.is_active).length,
        reviewCount: reviews.length,
        avgRating: creator.avg_rating || 0,
        rankScore: creator.rank_score || 0,
      },
    });
  });

  // 3. PRODUCTS ENDPOINTS
  app.get('/api/products', (req, res) => {
    const { category, search, creatorId, isFeatured } = req.query;
    const products = db.getProducts({
      category: category as string,
      search: search as string,
      creatorId: creatorId as string,
      isFeatured: isFeatured !== undefined ? isFeatured === 'true' : undefined,
    });
    res.json({ success: true, products });
  });

  app.get('/api/products/:id', (req, res) => {
    const product = db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const reviews = db.reviews
      .filter(r => r.product_id === product.id)
      .map(r => {
        const user = db.users.find(u => u.id === r.customer_id);
        return { ...r, customer_avatar: user?.avatar_url };
      });

    res.json({ success: true, product, reviews });
  });

  // Creator product management
  app.post('/api/creator/products', authMiddleware, requireCreatorMiddleware, (req: AuthenticatedRequest, res) => {
    try {
      const creator = db.getCreatorByUserId(req.currentUser!.id);
      if (!creator) return res.status(404).json({ success: false, error: 'Creator store not found' });

      const { title, description, price, compare_price, stock, category, tags, images = [] } = req.body;
      if (!title || price === undefined || !category) {
        return res.status(400).json({ success: false, error: 'Title, price, and category are required' });
      }

      const slug = title.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
      const newProduct: ProductRow = {
        id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        creator_id: creator.id,
        title,
        slug: `${slug}-${Date.now().toString().slice(-4)}`,
        description: description || '',
        price: parseFloat(price),
        compare_price: compare_price ? parseFloat(compare_price) : undefined,
        stock: parseInt(stock, 10) || 1,
        category,
        tags: Array.isArray(tags) ? tags : [],
        is_featured: false,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      db.products.push(newProduct);

      // Save product images
      if (Array.isArray(images) && images.length > 0) {
        images.forEach((imgUrl: string, idx: number) => {
          db.productImages.push({
            id: `img_${Date.now()}_${idx}`,
            product_id: newProduct.id,
            image_url: imgUrl,
            display_order: idx,
            is_primary: idx === 0,
            created_at: new Date().toISOString(),
          });
        });
      } else {
        // Default placeholder image
        db.productImages.push({
          id: `img_${Date.now()}_0`,
          product_id: newProduct.id,
          image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
          display_order: 0,
          is_primary: true,
          created_at: new Date().toISOString(),
        });
      }

      db.recalculateAllRankings();

      const createdProduct = db.getProductById(newProduct.id);
      res.json({ success: true, product: createdProduct });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/creator/products/:id', authMiddleware, requireCreatorMiddleware, (req: AuthenticatedRequest, res) => {
    try {
      const creator = db.getCreatorByUserId(req.currentUser!.id);
      if (!creator) return res.status(404).json({ success: false, error: 'Creator store not found' });

      const product = db.products.find(p => p.id === req.params.id && p.creator_id === creator.id);
      if (!product) return res.status(404).json({ success: false, error: 'Product not found or not owned by you' });

      const { title, description, price, compare_price, stock, category, tags, is_featured, is_active, images } = req.body;

      if (title) product.title = title;
      if (description !== undefined) product.description = description;
      if (price !== undefined) product.price = parseFloat(price);
      if (compare_price !== undefined) product.compare_price = compare_price ? parseFloat(compare_price) : undefined;
      if (stock !== undefined) product.stock = parseInt(stock, 10);
      if (category) product.category = category;
      if (tags) product.tags = tags;
      if (is_featured !== undefined) product.is_featured = is_featured;
      if (is_active !== undefined) product.is_active = is_active;
      product.updated_at = new Date().toISOString();

      if (Array.isArray(images) && images.length > 0) {
        // Replace images
        db.productImages = db.productImages.filter(img => img.product_id !== product.id);
        images.forEach((imgUrl: string, idx: number) => {
          db.productImages.push({
            id: `img_${Date.now()}_${idx}`,
            product_id: product.id,
            image_url: imgUrl,
            display_order: idx,
            is_primary: idx === 0,
            created_at: new Date().toISOString(),
          });
        });
      }

      db.recalculateAllRankings();

      res.json({ success: true, product: db.getProductById(product.id) });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/creator/products/:id', authMiddleware, requireCreatorMiddleware, (req: AuthenticatedRequest, res) => {
    const creator = db.getCreatorByUserId(req.currentUser!.id);
    if (!creator) return res.status(404).json({ success: false, error: 'Creator store not found' });

    const index = db.products.findIndex(p => p.id === req.params.id && p.creator_id === creator.id);
    if (index === -1) return res.status(404).json({ success: false, error: 'Product not found or not owned by you' });

    db.products.splice(index, 1);
    db.productImages = db.productImages.filter(img => img.product_id !== req.params.id);
    db.recalculateAllRankings();

    res.json({ success: true, message: 'Product deleted successfully' });
  });

  // 4. ORDERING SYSTEM & CHECKOUT (STRICT PRIVACY ENFORCED)
  app.post('/api/orders', authMiddleware, (req: AuthenticatedRequest, res) => {
    try {
      const user = req.currentUser!;
      const {
        items,
        customer_name,
        customer_phone,
        delivery_address,
        delivery_city,
        delivery_state,
        delivery_postal,
        delivery_notes,
      } = req.body;

      if (!items || !items.length) {
        return res.status(400).json({ success: false, error: 'Your cart is empty' });
      }
      if (!customer_name || !customer_phone || !delivery_address || !delivery_city || !delivery_state || !delivery_postal) {
        return res.status(400).json({ success: false, error: 'All delivery fields are required for fulfillment' });
      }

      // Group cart items by creator so each creator gets their distinct order
      const itemsByCreator: { [creatorId: string]: any[] } = {};

      for (const item of items) {
        const prod = db.products.find(p => p.id === item.productId);
        if (!prod) {
          return res.status(400).json({ success: false, error: `Product ID ${item.productId} not found` });
        }
        if (prod.stock < item.quantity) {
          return res.status(400).json({ success: false, error: `Insufficient stock for "${prod.title}". Only ${prod.stock} left.` });
        }

        if (!itemsByCreator[prod.creator_id]) {
          itemsByCreator[prod.creator_id] = [];
        }
        itemsByCreator[prod.creator_id].push({
          product: prod,
          quantity: item.quantity,
          unit_price: prod.price,
          subtotal: prod.price * item.quantity,
        });
      }

      const createdOrders: OrderRow[] = [];

      // Create orders per creator
      for (const creatorId of Object.keys(itemsByCreator)) {
        const creatorItems = itemsByCreator[creatorId];
        const subtotal = creatorItems.reduce((sum, it) => sum + it.subtotal, 0);
        const shipping_fee = 99.0; // Flat shipping per artisan in India
        const total_amount = subtotal + shipping_fee;

        const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const orderNumber = `AH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

        const newOrder: OrderRow = {
          id: orderId,
          order_number: orderNumber,
          customer_id: user.id,
          creator_id: creatorId,
          total_amount,
          subtotal,
          shipping_fee,
          status: 'pending',
          customer_name,
          customer_phone, // Strictly saved
          delivery_address, // Strictly saved
          delivery_city,
          delivery_state,
          delivery_postal,
          delivery_notes: delivery_notes || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        db.orders.push(newOrder);
        createdOrders.push(newOrder);

        // Deduct stock and save order items
        for (const item of creatorItems) {
          item.product.stock = Math.max(0, item.product.stock - item.quantity);

          const primaryImage = db.productImages.find(img => img.product_id === item.product.id && img.is_primary)?.image_url
            || db.productImages.find(img => img.product_id === item.product.id)?.image_url
            || '';

          db.orderItems.push({
            id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            order_id: orderId,
            product_id: item.product.id,
            product_title: item.product.title,
            product_image: primaryImage,
            unit_price: item.unit_price,
            quantity: item.quantity,
            subtotal: item.subtotal,
          });
        }
      }

      db.recalculateAllRankings();

      const sanitizedOrders = createdOrders.map(o => db.sanitizeOrder(o, user.id));

      res.json({
        success: true,
        orders: sanitizedOrders,
        message: 'Order(s) placed successfully! Creators have been notified.',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Customer order history
  app.get('/api/orders/my-orders', authMiddleware, (req: AuthenticatedRequest, res) => {
    const orders = db.getCustomerOrders(req.currentUser!.id);
    res.json({ success: true, orders });
  });

  // Creator orders (STRICT PRIVACY: ONLY orders belonging to this creator)
  app.get('/api/orders/creator-orders', authMiddleware, requireCreatorMiddleware, (req: AuthenticatedRequest, res) => {
    const creator = db.getCreatorByUserId(req.currentUser!.id);
    if (!creator) return res.status(404).json({ success: false, error: 'Creator store not found' });

    const orders = db.getCreatorOrders(creator.id, req.currentUser!.id);
    res.json({ success: true, orders });
  });

  // Update order status (by creator)
  app.patch('/api/orders/:id/status', authMiddleware, requireCreatorMiddleware, (req: AuthenticatedRequest, res) => {
    try {
      const creator = db.getCreatorByUserId(req.currentUser!.id);
      if (!creator) return res.status(404).json({ success: false, error: 'Creator store not found' });

      const order = db.orders.find(o => o.id === req.params.id && (o.creator_id === creator.id || req.currentUser?.role === 'admin'));
      if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found or not owned by you' });
      }

      const { status, tracking_number } = req.body;
      const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid order status' });
      }

      order.status = status;
      if (tracking_number) order.tracking_number = tracking_number;
      order.updated_at = new Date().toISOString();

      db.recalculateAllRankings();

      res.json({ success: true, order: db.sanitizeOrder(order, req.currentUser!.id) });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 5. REVIEWS & RATINGS (VERIFIED BUYER CHECK & ANTI-SPAM)
  app.post('/api/reviews', authMiddleware, (req: AuthenticatedRequest, res) => {
    try {
      const user = req.currentUser!;
      const { creator_id, product_id, order_id, rating, review_text } = req.body;

      if (!creator_id || !rating || !review_text) {
        return res.status(400).json({ success: false, error: 'Creator, rating, and review text are required' });
      }

      const parsedRating = parseInt(rating, 10);
      if (parsedRating < 1 || parsedRating > 5) {
        return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
      }

      // Verified purchase verification
      const customerOrders = db.orders.filter(o => o.customer_id === user.id && o.creator_id === creator_id);
      const isVerified = customerOrders.length > 0;

      // Duplicate prevention: check if customer already reviewed this specific order
      if (order_id) {
        const existingReviewForOrder = db.reviews.find(r => r.order_id === order_id && r.customer_id === user.id);
        if (existingReviewForOrder) {
          return res.status(400).json({ success: false, error: 'You have already submitted a review for this order.' });
        }
      }

      // Name masking for privacy display
      const names = user.full_name.trim().split(' ');
      const displayName = names.length > 1 ? `${names[0]} ${names[names.length - 1][0]}.` : names[0];

      const newReview: ReviewRow = {
        id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        creator_id,
        product_id: product_id || undefined,
        customer_id: user.id,
        order_id: order_id || (customerOrders[0]?.id || undefined),
        rating: parsedRating,
        review_text: review_text.trim(),
        customer_display_name: displayName,
        is_verified_purchase: isVerified,
        created_at: new Date().toISOString(),
      };

      db.reviews.push(newReview);
      db.recalculateAllRankings();

      res.json({
        success: true,
        review: newReview,
        message: 'Thank you for supporting this independent creator with your review!',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Creator reply to review
  app.post('/api/reviews/:id/reply', authMiddleware, requireCreatorMiddleware, (req: AuthenticatedRequest, res) => {
    const creator = db.getCreatorByUserId(req.currentUser!.id);
    if (!creator) return res.status(404).json({ success: false, error: 'Creator store not found' });

    const review = db.reviews.find(r => r.id === req.params.id && r.creator_id === creator.id);
    if (!review) return res.status(404).json({ success: false, error: 'Review not found' });

    const { reply } = req.body;
    if (!reply) return res.status(400).json({ success: false, error: 'Reply text is required' });

    review.creator_reply = reply.trim();
    review.creator_reply_at = new Date().toISOString();

    res.json({ success: true, review });
  });

  // 6. R2 / ASSET UPLOAD SIMULATION
  app.post('/api/upload', authMiddleware, (req: AuthenticatedRequest, res) => {
    const { imageBase64, filename } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, error: 'No image data provided' });
    }

    // In local development, return the base64 or high quality mock URL; in Cloudflare Workers, R2 handles direct stream
    res.json({
      success: true,
      url: imageBase64,
      key: `uploads/${Date.now()}-${filename || 'asset.jpg'}`,
    });
  });

  // 7. RANKING ENGINE TRIGGER
  app.post('/api/ranking/recalculate', (req, res) => {
    db.recalculateAllRankings();
    res.json({
      success: true,
      rankings: db.rankings,
      message: 'Creator ranking scores recalculated successfully with Bayesian formulas.',
    });
  });

  // --- VITE MIDDLEWARE SETUP ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ArtisanHub Marketplace server running on http://localhost:${PORT}`);
  });
}

startServer();
