import { db } from '../../db/index.ts';
import { pricePredictions } from '../../db/schema.ts';
import { PreparedPriceFeatures } from './featurePreparation.ts';
import { logger } from '../logger.ts';

export const MODEL_VERSION = 'baseline-hedonic-v1.0 (scikit-learn-ready)';

export interface PriceFactor {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  impactPercentage: number;
  description: string;
}

export interface PriceRecommendationResult {
  cropName: string;
  unit: string;
  currentMarketRange: {
    min: number;
    max: number;
    modal: number;
  };
  suggestedMinPrice: number;
  suggestedMaxPrice: number;
  expectedPrice: number;
  confidence: 'Low' | 'Medium' | 'High';
  confidenceScore: number; // 0 to 100
  confidenceReason: string;
  explanation: string;
  majorFactors: PriceFactor[];
  modelVersion: string;
  isDemoEstimate: boolean;
  estimateLabel: string; // 'AI-assisted estimate'
  disclaimer: string;
  historicalSeries: {
    date: string;
    day: string;
    price: number;
    minPrice: number;
    maxPrice: number;
  }[];
  featuresUsed: {
    quantity: number;
    qualityGrade: string;
    location: string;
    recentTrend: string;
    demandLevel: string;
    activeBuyersCount: number;
  };
  dbRecordId?: number;
}

/**
 * Price Prediction Service
 * Implements a transparent baseline hedonic prediction method grounded in
 * verified APMC market data, daily historical trajectory, quality grading,
 * and regional buyer demand signals.
 *
 * NOTE: Decision support only. Does not guarantee higher prices or final bids.
 */
export class PricePredictionService {
  /**
   * Generates an AI-assisted price estimate bracket based on prepared features.
   */
  public async generateRecommendation(
    features: PreparedPriceFeatures,
    listingId?: number
  ): Promise<PriceRecommendationResult> {
    // 1. Transparent Baseline Price Computation
    const baseAnchor = features.currentMarketPrice;

    // Quality multiplier
    const qualityMult = features.qualityScoreMultiplier;
    const qualityImpactPct = Math.round((qualityMult - 1) * 100);

    // Trend momentum modifier
    let trendMult = 1.0;
    let trendImpactPct = 0;
    if (features.recentPriceTrend === 'up') {
      trendMult = 1.02;
      trendImpactPct = 2;
    } else if (features.recentPriceTrend === 'down') {
      trendMult = 0.98;
      trendImpactPct = -2;
    }

    // Demand modifier
    let demandMult = 1.0;
    let demandImpactPct = 0;
    if (features.demandLevel === 'high') {
      demandMult = 1.02;
      demandImpactPct = 2;
    } else if (features.demandLevel === 'low') {
      demandMult = 0.97;
      demandImpactPct = -3;
    }

    // Volume adjustment
    let volumeMult = 1.0;
    let volumeImpactPct = 0;
    if (features.quantity >= 1000) {
      volumeMult = 1.01; // Commercial wholesale efficiency
      volumeImpactPct = 1;
    } else if (features.quantity < 50) {
      volumeMult = 0.98; // Small lot transport overhead
      volumeImpactPct = -2;
    }

    // Baseline estimated mid price
    const rawExpected = baseAnchor * qualityMult * trendMult * demandMult * volumeMult;
    const expectedPrice = Math.round(rawExpected);

    // Realistic decision bracket (approx ±5-7% around expected, bounded reasonably)
    const suggestedMinPrice = Math.round(expectedPrice * 0.94);
    const suggestedMaxPrice = Math.round(expectedPrice * 1.06);

    // 2. Confidence Calculation
    // Computed dynamically from historical volatility, data freshness, and buyer density
    let confidenceScore = 75; // Default medium
    const reasons: string[] = [];

    // Historical volatility check
    if (features.historicalPriceStdDev <= 2.0) {
      confidenceScore += 10;
      reasons.push('Low historical price volatility in regional mandis');
    } else if (features.historicalPriceStdDev > 5.0) {
      confidenceScore -= 12;
      reasons.push('High price fluctuations observed recently');
    }

    // Sample size of observations
    if (features.historicalPrices.length >= 6) {
      confidenceScore += 8;
      reasons.push('Consistent 7-day APMC arrival records available');
    } else {
      confidenceScore -= 5;
    }

    // Active buyers presence
    if (features.activeNearbyBuyersCount >= 3) {
      confidenceScore += 5;
      reasons.push('Multiple active procurement buyers in nearby districts');
    }

    // Bound between 55% and 94%
    confidenceScore = Math.min(94, Math.max(55, confidenceScore));

    let confidenceLevel: 'Low' | 'Medium' | 'High' = 'Medium';
    if (confidenceScore >= 85) confidenceLevel = 'High';
    else if (confidenceScore < 70) confidenceLevel = 'Low';

    const confidenceReason = reasons.join(' • ') || 'Based on available APMC market benchmarks.';

    // 3. Major Factors Breakdown
    const majorFactors: PriceFactor[] = [
      {
        factor: 'Quality Grading',
        impact: qualityImpactPct > 0 ? 'positive' : qualityImpactPct < 0 ? 'negative' : 'neutral',
        impactPercentage: qualityImpactPct,
        description: `${features.qualityGrade} standard (${qualityImpactPct >= 0 ? '+' : ''}${qualityImpactPct}% vs base average)`,
      },
      {
        factor: 'Regional Mandi Baseline',
        impact: 'neutral',
        impactPercentage: 0,
        description: `Current benchmark modal price at local mandi is ₹${baseAnchor}/${features.unit}`,
      },
      {
        factor: 'Market Price Trend',
        impact: features.recentPriceTrend === 'up' ? 'positive' : features.recentPriceTrend === 'down' ? 'negative' : 'neutral',
        impactPercentage: trendImpactPct,
        description: `Recent trend is ${features.recentPriceTrend} (${features.recentTrendPercent >= 0 ? '+' : ''}${features.recentTrendPercent}%)`,
      },
      {
        factor: 'Local Buyer Demand',
        impact: features.demandLevel === 'high' ? 'positive' : features.demandLevel === 'low' ? 'negative' : 'neutral',
        impactPercentage: demandImpactPct,
        description: `${features.demandLevel.toUpperCase()} demand with ${features.activeNearbyBuyersCount} active verified buyers in radius`,
      },
    ];

    if (volumeImpactPct !== 0) {
      majorFactors.push({
        factor: 'Lot Volume',
        impact: volumeImpactPct > 0 ? 'positive' : 'negative',
        impactPercentage: volumeImpactPct,
        description: `${features.quantity} ${features.unit} lot scale adjustment (${volumeImpactPct >= 0 ? '+' : ''}${volumeImpactPct}%)`,
      });
    }

    // 4. Short Explanation of Major Factors
    let explanation = '';
    if (features.recentPriceTrend === 'up' && features.demandLevel === 'high') {
      explanation = `Recent market prices and local demand indicate a moderately higher expected range for ${features.cropName}.`;
    } else if (features.recentPriceTrend === 'down') {
      explanation = `Recent market arrivals have increased supply pressure, keeping the suggested range competitive.`;
    } else {
      explanation = `Regional market benchmark of ₹${baseAnchor}/${features.unit} and steady local demand support the suggested fair range.`;
    }

    // 5. Store Prediction in Database
    let dbRecordId: number | undefined;
    try {
      const [saved] = await db
        .insert(pricePredictions)
        .values({
          listingId: listingId || null,
          cropName: features.cropName,
          minPrice: suggestedMinPrice,
          maxPrice: suggestedMaxPrice,
          expectedPrice,
          confidence: `${confidenceLevel} (${confidenceScore}%)`,
          confidenceScore,
          modelVersion: MODEL_VERSION,
          explanation,
          featuresJson: JSON.stringify({
            vector: features.numericVector,
            featureNames: features.featureNames,
            qualityGrade: features.qualityGrade,
            demandLevel: features.demandLevel,
          }),
        })
        .returning();

      dbRecordId = saved?.id;
    } catch (dbErr) {
      logger.warn('Could not persist price prediction record to database:', { error: String(dbErr) });
    }

    return {
      cropName: features.cropName,
      unit: features.unit,
      currentMarketRange: {
        min: features.currentMarketMin,
        max: features.currentMarketMax,
        modal: features.currentMarketPrice,
      },
      suggestedMinPrice,
      suggestedMaxPrice,
      expectedPrice,
      confidence: confidenceLevel,
      confidenceScore,
      confidenceReason,
      explanation,
      majorFactors,
      modelVersion: MODEL_VERSION,
      isDemoEstimate: true,
      estimateLabel: 'AI-assisted estimate',
      disclaimer:
        'This system provides decision support, NOT a guaranteed selling price. Actual transaction prices depend on mutual buyer agreement.',
      historicalSeries: features.historicalPrices,
      featuresUsed: {
        quantity: features.quantity,
        qualityGrade: features.qualityGrade,
        location: features.location,
        recentTrend: features.recentPriceTrend,
        demandLevel: features.demandLevel,
        activeBuyersCount: features.activeNearbyBuyersCount,
      },
      dbRecordId,
    };
  }

  /**
   * Scikit-Learn Replacement Hook
   * When an external trained model artifact is plugged in, this method can run
   * model.predict(features.numericVector) without changing any API contract.
   */
  public async predictWithSklearn(
    features: PreparedPriceFeatures
  ): Promise<PriceRecommendationResult | null> {
    // Scaffold hook: In prototype phase, returns null so the transparent baseline is used.
    // In production with a trained pickle/ONNX model:
    // const prediction = await sklearnRuntime.predict([features.numericVector]);
    return null;
  }
}

export const pricePredictionService = new PricePredictionService();
