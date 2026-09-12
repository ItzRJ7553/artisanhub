/**
 * Cloudflare Worker Backend for ArtisanHub Marketplace
 * Native implementation using Cloudflare D1 Database & R2 Storage bindings
 */

export interface Env {
  DB: any; // Cloudflare D1Database binding
  ASSETS_BUCKET: any; // Cloudflare R2Bucket binding
  ASSETS: any; // Cloudflare Pages / Workers static assets fetcher
  JWT_SECRET: string;
  R2_PUBLIC_DOMAIN?: string;
}

// Minimal JWT verification for Cloudflare Edge Web Crypto
async function signJwt(payload: any, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const header = { alg: 'HS256', typ: 'JWT' };
  const strHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const strPayload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(`${strHeader}.${strPayload}`));
  const strSig = btoa(String.fromCharCode(...new Uint8Array(sigBuf))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${strHeader}.${strPayload}.${strSig}`;
}

async function verifyJwt(token: string, secret: string): Promise<any | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const rawSig = Uint8Array.from(atob(signature.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify('HMAC', key, rawSig, enc.encode(`${header}.${payload}`));
    if (!valid) return null;
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const secret = env.JWT_SECRET || 'dev-secret-artisanhub-d1';

    // CORS helper
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Helper for JSON responses
    const json = (data: any, status = 200) => {
      return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    };

    // Helper to get authenticated user
    const getAuthUser = async () => {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
      const token = authHeader.substring(7);
      return await verifyJwt(token, secret);
    };

    // API Routes for Cloudflare D1
    if (url.pathname.startsWith('/api/')) {
      const path = url.pathname.replace('/api', '');

      // GET /api/health
      if (path === '/health') {
        return json({ status: 'ok', runtime: 'Cloudflare Worker', timestamp: new Date().toISOString() });
      }

      // GET /api/creators - Public listing with multi-factor ranking
      if (path === '/creators' && request.method === 'GET') {
        const category = url.searchParams.get('category');
        const search = url.searchParams.get('search');
        const sort = url.searchParams.get('sort') || 'recommended';

        let query = `
          SELECT cp.*, cr.score as rank_score, cr.avg_rating, cr.total_reviews, cr.completed_orders, cr.product_count
          FROM creator_profiles cp
          LEFT JOIN creator_rankings cr ON cp.id = cr.creator_id
          WHERE cp.status = 'active'
        `;
        const params: any[] = [];

        if (category && category !== 'All') {
          query += ` AND cp.category = ?`;
          params.push(category);
        }
        if (search) {
          query += ` AND (cp.store_name LIKE ? OR cp.headline LIKE ? OR cp.bio LIKE ?)`;
          const term = `%${search}%`;
          params.push(term, term, term);
        }

        if (sort === 'rating') {
          query += ` ORDER BY cr.avg_rating DESC, cr.total_reviews DESC`;
        } else if (sort === 'orders') {
          query += ` ORDER BY cr.completed_orders DESC`;
        } else if (sort === 'newest') {
          query += ` ORDER BY cp.created_at DESC`;
        } else {
          // Default: Multi-factor composite ranking score
          query += ` ORDER BY cr.score DESC, cr.total_reviews DESC`;
        }

        const stmt = env.DB.prepare(query).bind(...params);
        const { results } = await stmt.all();
        return json({ success: true, creators: results });
      }

      // GET /api/creators/:slug - Public creator store page
      if (path.startsWith('/creators/') && request.method === 'GET') {
        const slug = path.split('/')[2];
        const creatorStmt = env.DB.prepare(`
          SELECT cp.*, cr.score as rank_score, cr.avg_rating, cr.total_reviews, cr.completed_orders, cr.product_count
          FROM creator_profiles cp
          LEFT JOIN creator_rankings cr ON cp.id = cr.creator_id
          WHERE cp.slug = ?
        `).bind(slug);
        const creator = await creatorStmt.first();

        if (!creator) {
          return json({ success: false, error: 'Creator not found' }, 404);
        }

        // Fetch products
        const productsStmt = env.DB.prepare(`
          SELECT p.*, 
            (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
          FROM products p
          WHERE p.creator_id = ? AND p.is_active = 1
          ORDER BY p.is_featured DESC, p.created_at DESC
        `).bind(creator.id);
        const { results: products } = await productsStmt.all();

        // Fetch reviews
        const reviewsStmt = env.DB.prepare(`
          SELECT r.*, u.avatar_url as customer_avatar
          FROM reviews r
          LEFT JOIN users u ON r.customer_id = u.id
          WHERE r.creator_id = ?
          ORDER BY r.created_at DESC
          LIMIT 50
        `).bind(creator.id);
        const { results: reviews } = await reviewsStmt.all();

        return json({ success: true, creator, products, reviews });
      }

      // R2 Image Upload Handler
      if (path === '/upload' && request.method === 'POST') {
        const user = await getAuthUser();
        if (!user) return json({ success: false, error: 'Unauthorized' }, 401);

        const formData = await request.formData();
        const file = formData.get('file') as File;
        if (!file) return json({ success: false, error: 'No file uploaded' }, 400);

        const key = `uploads/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        await env.ASSETS_BUCKET.put(key, file.stream(), {
          httpMetadata: { contentType: file.type },
        });

        const publicUrl = env.R2_PUBLIC_DOMAIN ? `${env.R2_PUBLIC_DOMAIN}/${key}` : `/api/assets/${key}`;
        return json({ success: true, url: publicUrl, key });
      }
    }

    // Fallback: serve static assets from Cloudflare Pages / Workers Assets
    return env.ASSETS ? await env.ASSETS.fetch(request) : new Response('ArtisanHub Edge API', { status: 200 });
  },
};
