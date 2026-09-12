-- Cloudflare D1 Database Schema for Multi-Vendor Creator Marketplace
-- File: schema.sql (can be executed via `wrangler d1 execute DB --file=./schema.sql`)

-- 1. Users Table (Customers, Creators, Admins)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer' CHECK(role IN ('customer', 'creator', 'admin')),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Creator Profiles Table
CREATE TABLE IF NOT EXISTS creator_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    store_name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    banner_url TEXT,
    headline TEXT,
    bio TEXT,
    category TEXT NOT NULL DEFAULT 'Crafts',
    contact_email TEXT,
    phone TEXT,
    store_address TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'United States',
    postal_code TEXT,
    shipping_policy TEXT,
    return_policy TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'pending', 'suspended')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    creator_id TEXT NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT NOT NULL,
    price REAL NOT NULL CHECK(price >= 0),
    compare_price REAL,
    stock INTEGER NOT NULL DEFAULT 1 CHECK(stock >= 0),
    category TEXT NOT NULL,
    tags TEXT, -- JSON array of tags or comma-separated strings
    is_featured INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES creator_profiles(id) ON DELETE CASCADE
);

-- 4. Product Images Table (Cloudflare R2 image keys / URLs)
CREATE TABLE IF NOT EXISTS product_images (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_primary INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 5. Orders Table
-- STRICT PRIVACY: customer_phone and delivery_address must only be accessible
-- to the customer, the fulfilling creator, or administrators.
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    customer_id TEXT NOT NULL,
    creator_id TEXT NOT NULL,
    total_amount REAL NOT NULL,
    subtotal REAL NOT NULL,
    shipping_fee REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_city TEXT NOT NULL,
    delivery_state TEXT NOT NULL,
    delivery_postal TEXT NOT NULL,
    delivery_notes TEXT,
    tracking_number TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (creator_id) REFERENCES creator_profiles(id)
);

-- 6. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_title TEXT NOT NULL,
    product_image TEXT,
    unit_price REAL NOT NULL,
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    subtotal REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 7. Reviews Table (Verified customer ratings & feedback)
CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    creator_id TEXT NOT NULL,
    product_id TEXT,
    customer_id TEXT NOT NULL,
    order_id TEXT,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    customer_display_name TEXT NOT NULL,
    is_verified_purchase INTEGER DEFAULT 1,
    creator_reply TEXT,
    creator_reply_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES creator_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- 8. Creator Rankings Table (Multi-factor ranking engine output)
CREATE TABLE IF NOT EXISTS creator_rankings (
    creator_id TEXT PRIMARY KEY,
    score REAL NOT NULL DEFAULT 0.0,
    bayesian_rating REAL NOT NULL DEFAULT 0.0,
    avg_rating REAL NOT NULL DEFAULT 0.0,
    total_reviews INTEGER NOT NULL DEFAULT 0,
    completed_orders INTEGER NOT NULL DEFAULT 0,
    product_count INTEGER NOT NULL DEFAULT 0,
    activity_score REAL NOT NULL DEFAULT 0.0,
    last_calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES creator_profiles(id) ON DELETE CASCADE
);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_products_creator ON products(creator_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_creator ON orders(creator_id);
CREATE INDEX IF NOT EXISTS idx_reviews_creator ON reviews(creator_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer ON reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_rankings_score ON creator_rankings(score DESC);
