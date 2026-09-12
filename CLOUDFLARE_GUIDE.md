# Cloudflare Deployment & Architecture Guide

This marketplace is built to run seamlessly on Cloudflare's serverless edge infrastructure using **Cloudflare Pages / Workers**, **Cloudflare D1 (Serverless SQLite)**, and **Cloudflare R2 (Object Storage)**.

---

## 1. Cloudflare Tech Stack Overview

| Component | Cloudflare Service | Role |
| :--- | :--- | :--- |
| **Frontend** | Cloudflare Pages / Workers Static Assets | React 19 + TypeScript + Tailwind CSS |
| **Backend API** | Cloudflare Workers | Edge API handling auth, ranking engine, privacy enforcement |
| **Database** | Cloudflare D1 | Distributed SQL database storing users, stores, products, orders, reviews |
| **File / Image Storage** | Cloudflare R2 | S3-compatible zero-egress bucket for product photos and store logos |
| **Authentication** | Workers JWT / Cloudflare Web Crypto | Secure HMAC-SHA256 tokens with HTTP-only cookies |

---

## 2. Step-by-Step Cloudflare Provisioning

### Step 1: Install Wrangler CLI & Authenticate
```bash
npm install -g wrangler
wrangler login
```

### Step 2: Create the Cloudflare D1 Database
```bash
wrangler d1 create artisanhub-d1
```
*Copy the `database_id` output and update it in `wrangler.toml`:*
```toml
[[d1_databases]]
binding = "DB"
database_name = "artisanhub-d1"
database_id = "<PASTE_YOUR_DATABASE_ID_HERE>"
```

### Step 3: Run Database Migrations
Execute the initial schema directly on your remote D1 database:
```bash
wrangler d1 execute artisanhub-d1 --file=./schema.sql
```

To test locally with Wrangler's local SQLite emulator:
```bash
wrangler d1 execute artisanhub-d1 --local --file=./schema.sql
```

### Step 4: Create the Cloudflare R2 Bucket for Images
```bash
wrangler r2 bucket create artisanhub-r2-images
```
Enable Public Access or configure a custom domain on the R2 bucket in the Cloudflare Dashboard:
- Go to **R2** > **artisanhub-r2-images** > **Settings** > **Custom Domains** or **Public R2.dev URL**.

### Step 5: Set Worker Secrets
Securely store your production secrets in Cloudflare:
```bash
wrangler secret put JWT_SECRET
# Enter a secure 32+ character random string
```

### Step 6: Build and Deploy to Cloudflare
```bash
# 1. Build the React frontend
npm run build

# 2. Deploy the Worker and static assets to Cloudflare
wrangler deploy
```

---

## 3. Strict Backend Privacy & Security Model

The backend strictly enforces role-based and ownership-based data filtering:

1. **Customer PII Isolation**:
   - Customer phone numbers, delivery addresses, and delivery notes are **never** returned in public product or creator endpoints.
   - For orders, customer PII is only included if `requester.id === order.customer_id`, or `requester.id === creator.user_id` for that specific order, or `requester.role === 'admin'`.
2. **Creator Isolation**:
   - When a creator queries `/api/orders/creator-orders`, the query strictly binds `WHERE creator_id = ?` matching their authenticated session.
   - Creators cannot view other creators' order lists, revenue, or customer data by tampering with IDs.
3. **Verified Review Integrity**:
   - Only customers who have a completed/valid order with a creator can post verified reviews.
   - Duplicate reviews for the same order are blocked at the database level.

---

## 4. Multi-Factor Creator Ranking Formula

To ensure new high-quality creators can grow while preventing manipulation (e.g. 1 fake 5.0 review beating 50 genuine reviews), the platform uses a composite Bayesian formula:

$$\text{Rank Score} = (W_r \times \text{Bayesian Rating}) + (W_o \times \text{Order Volume Score}) + (W_p \times \text{Catalog Health}) + (W_a \times \text{Activity Recency})$$

Where:
- **Bayesian Rating**: Weighted average using prior platform mean $(M=4.5, K=5)$ so creators need multiple consistent reviews to achieve top rank.
- **Order Volume Score**: Rewarding completed order reliability and repeat customer satisfaction.
- **Catalog Health**: Active in-stock products with rich descriptions and images.
- **Activity Recency**: Recent order fulfillment and store updates.
