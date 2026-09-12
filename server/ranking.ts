/**
 * Multi-Factor Creator Ranking Engine
 * Implements Bayesian Average, Order Fulfillment Weight, Catalog Health, and Activity Recency
 */

export interface CreatorStats {
  creator_id: string;
  avg_rating: number;
  total_reviews: number;
  completed_orders: number;
  product_count: number;
  days_since_last_order: number;
  days_since_created: number;
}

export function calculateCreatorRankingScore(stats: CreatorStats): {
  score: number;
  bayesianRating: number;
  activityScore: number;
} {
  // 1. Bayesian Weighted Average Rating
  // Formula: WR = (v / (v + m)) * R + (m / (v + m)) * C
  // Where:
  // R = creator average rating
  // v = number of reviews for creator
  // m = minimum confidence threshold (5 reviews)
  // C = platform global baseline mean rating (4.2)
  const m = 5.0; // confidence threshold
  const C = 4.2; // platform mean rating
  const v = Math.max(0, stats.total_reviews);
  const R = stats.avg_rating > 0 ? stats.avg_rating : C;

  const bayesianRating = (v / (v + m)) * R + (m / (v + m)) * C;

  // 2. Order Volume & Fulfillment Factor (Logarithmic scaling so it doesn't skew infinitely)
  // Scaled 0 to 100
  const orderFactor = Math.min(30, Math.log10(stats.completed_orders + 1) * 20);

  // 3. Product Catalog Health (Having active, in-stock products)
  const catalogFactor = Math.min(20, Math.log10(stats.product_count + 1) * 15);

  // 4. Recency & Activity Score (Bonus for active, responsive sellers)
  let activityScore = 15;
  if (stats.days_since_last_order <= 7) {
    activityScore = 20; // very active
  } else if (stats.days_since_last_order <= 30) {
    activityScore = 15;
  } else if (stats.days_since_last_order <= 90) {
    activityScore = 10;
  } else {
    activityScore = 5;
  }

  // 5. Total Composite Score (0 - 100 Scale)
  // Weight Breakdown:
  // - Bayesian Rating: max 50 points (scaled from 1.0 - 5.0)
  // - Order Volume & Reliability: max 25 points
  // - Catalog Variety: max 15 points
  // - Activity & Recency: max 10 points
  const ratingPoints = (bayesianRating / 5.0) * 50;
  const orderPoints = (orderFactor / 30) * 25;
  const catalogPoints = (catalogFactor / 20) * 15;
  const activityPoints = (activityScore / 20) * 10;

  const totalScore = Math.round((ratingPoints + orderPoints + catalogPoints + activityPoints) * 10) / 10;

  return {
    score: totalScore,
    bayesianRating: Math.round(bayesianRating * 100) / 100,
    activityScore: Math.round(activityPoints * 10) / 10,
  };
}
