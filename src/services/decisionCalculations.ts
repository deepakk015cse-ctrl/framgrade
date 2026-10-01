// Reusable Decision Support & Financial Calculation Service for FarmGrade
// Keeps business logic separate from UI and enforces strict numeric validation & zero-hallucination rules.

export interface CostInputs {
  transportCost?: number | null;
  loadingCost?: number | null;
  otherCost?: number | null;
}

export interface OfferNetRealisationInput {
  id: string;
  buyerName: string;
  buyerCompany?: string;
  location?: string;
  distanceKm?: number;
  pickupOption?: string;
  paymentTerms?: string;
  bidPricePerUnit: number;
  quantity: number;
  unit?: string;
  transportCost?: number | null;
  loadingCost?: number | null;
  otherCost?: number | null;
  status?: string;
}

export interface OfferNetRealisationResult {
  id: string;
  buyerName: string;
  buyerCompany?: string;
  location?: string;
  distanceKm?: number;
  pickupOption?: string;
  paymentTerms?: string;
  bidPricePerUnit: number;
  quantity: number;
  unit: string;
  grossAmount: number;
  transportCost: number;
  loadingCost: number;
  otherCost: number;
  estimatedTotalCosts: number;
  expectedNetRealisation: number;
  netPerUnit: number;
  hasCostInformation: boolean;
  missingCostNote: string | null;
  label: string;
  status?: string;
}

export interface WhatIfScenarioInput {
  id: string;
  scenarioName: string;
  buyerId?: string;
  buyerName: string;
  quantity: number;
  unit?: string;
  bidPrice: number;
  transportCost: number;
  loadingCost: number;
  otherCost: number;
  sellingScenario?: string; // e.g., 'Sell Today', 'Direct Farm-Gate', 'Wait 2-3 Days (Storage)'
}

export interface WhatIfScenarioResult extends WhatIfScenarioInput {
  unit: string;
  grossAmount: number;
  estimatedCosts: number;
  estimatedNetRealisation: number;
  netPerUnit: number;
  isFutureScenario: boolean;
  futureNote: string | null;
}

export interface ExplainablePriceFactor {
  key:
    | 'current_market_price'
    | 'recent_trend'
    | 'historical_prices'
    | 'local_market_conditions'
    | 'buyer_demand'
    | 'produce_quantity'
    | 'produce_quality'
    | 'location'
    | 'nearby_offers';
  label: string;
  value: string;
  detail?: string;
}

export interface ExplainablePriceInsightInput {
  cropName?: string;
  unit?: string;
  currentMarketPrice?: number | null;
  marketMin?: number | null;
  marketMax?: number | null;
  recentTrend?: string | null;
  historicalSeriesCount?: number;
  localMarketName?: string | null;
  buyerDemand?: string | null;
  quantity?: number | null;
  quality?: string | null;
  location?: string | null;
  nearbyOffersMin?: number | null;
  nearbyOffersMax?: number | null;
  nearbyOffersCount?: number | null;
  expectedMin?: number | null;
  expectedMax?: number | null;
  confidence?: 'Low' | 'Medium' | 'High' | string | null;
}

export interface ExplainablePriceInsightResult {
  cropName: string;
  unit: string;
  expectedRangeText: string;
  expectedMin: number | null;
  expectedMax: number | null;
  confidence: string | null;
  hasLimitedInformation: boolean;
  limitedInfoMessage: string | null;
  factors: ExplainablePriceFactor[];
  disclaimer: string;
}

/**
 * Validates and clamps a numeric value to prevent negative numbers, NaN, or Infinity.
 */
export function sanitizeNonNegativeNumber(value: unknown, fallback = 0, max = 10_000_000): number {
  if (value === null || value === undefined || value === '') return fallback;
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || Number.isNaN(parsed)) return fallback;
  if (parsed < 0) return 0;
  if (parsed > max) return max;
  return Math.round(parsed * 100) / 100;
}

/**
 * Validates a positive quantity (>= 1).
 */
export function sanitizeQuantity(value: unknown, fallback = 1): number {
  const clean = sanitizeNonNegativeNumber(value, fallback, 1_000_000);
  return clean <= 0 ? Math.max(1, fallback) : clean;
}

/**
 * Validates a positive price (>= 0).
 */
export function sanitizePrice(value: unknown, fallback = 0): number {
  return sanitizeNonNegativeNumber(value, fallback, 1_000_000);
}

/**
 * Calculates Gross Amount, Estimated Total Costs, and Expected Net Realisation for a single buyer offer.
 */
export function calculateOfferNetRealisation(
  input: OfferNetRealisationInput
): OfferNetRealisationResult {
  const unit = input.unit || 'kg';
  const quantity = sanitizeQuantity(input.quantity, 1);
  const bidPricePerUnit = sanitizePrice(input.bidPricePerUnit, 0);

  const hasCostInformation =
    (input.transportCost !== undefined && input.transportCost !== null) ||
    (input.loadingCost !== undefined && input.loadingCost !== null) ||
    (input.otherCost !== undefined && input.otherCost !== null);

  const transportCost = sanitizeNonNegativeNumber(input.transportCost, 0);
  const loadingCost = sanitizeNonNegativeNumber(input.loadingCost, 0);
  const otherCost = sanitizeNonNegativeNumber(input.otherCost, 0);

  const grossAmount = Math.round(bidPricePerUnit * quantity);
  const estimatedTotalCosts = Math.round(transportCost + loadingCost + otherCost);
  const expectedNetRealisation = Math.max(0, grossAmount - estimatedTotalCosts);
  const netPerUnit =
    quantity > 0 ? Math.round((expectedNetRealisation / quantity) * 100) / 100 : 0;

  return {
    id: input.id,
    buyerName: input.buyerName,
    buyerCompany: input.buyerCompany,
    location: input.location,
    distanceKm: input.distanceKm,
    pickupOption: input.pickupOption,
    paymentTerms: input.paymentTerms,
    bidPricePerUnit,
    quantity,
    unit,
    grossAmount,
    transportCost,
    loadingCost,
    otherCost,
    estimatedTotalCosts,
    expectedNetRealisation,
    netPerUnit,
    hasCostInformation,
    missingCostNote: hasCostInformation
      ? null
      : 'Cost information is not available. Enter the estimated cost to calculate net realisation.',
    label: 'Estimated Net Realisation',
    status: input.status,
  };
}

/**
 * Calculates Net Realisation across multiple buyer offers without automatically choosing a buyer for the farmer.
 */
export function compareBuyerOffersNetRealisation(
  offers: OfferNetRealisationInput[],
  overrideCosts?: CostInputs,
  overrideQuantity?: number
): {
  offers: OfferNetRealisationResult[];
  hasAnyCostInput: boolean;
  disclaimer: string;
} {
  const results = offers.map((offer) => {
    const isFarmGateZeroTransport =
      offer.pickupOption &&
      offer.pickupOption.toLowerCase().includes('farm gate') &&
      offer.transportCost === 0 &&
      (overrideCosts?.transportCost === undefined || overrideCosts?.transportCost === null);

    return calculateOfferNetRealisation({
      ...offer,
      quantity: overrideQuantity ? sanitizeQuantity(overrideQuantity, offer.quantity) : offer.quantity,
      transportCost:
        overrideCosts?.transportCost !== undefined && overrideCosts?.transportCost !== null
          ? isFarmGateZeroTransport
            ? 0
            : overrideCosts.transportCost
          : offer.transportCost,
      loadingCost:
        overrideCosts?.loadingCost !== undefined && overrideCosts?.loadingCost !== null
          ? overrideCosts.loadingCost
          : offer.loadingCost,
      otherCost:
        overrideCosts?.otherCost !== undefined && overrideCosts?.otherCost !== null
          ? overrideCosts.otherCost
          : offer.otherCost,
    });
  });

  const hasAnyCostInput = results.some((r) => r.hasCostInformation);

  return {
    offers: results,
    hasAnyCostInput,
    disclaimer:
      'Estimated Net Realisation is an estimate based on your entered costs and buyer offers, not a guaranteed final amount. Compare the options and make your own decision.',
  };
}

/**
 * Evaluates What-If Simulator scenarios and returns immediate Gross Amount, Estimated Costs, and Estimated Net Realisation.
 */
export function evaluateWhatIfScenarios(scenarios: WhatIfScenarioInput[]): {
  scenarios: WhatIfScenarioResult[];
  disclaimer: string;
} {
  const evaluated: WhatIfScenarioResult[] = scenarios.map((sc, idx) => {
    const quantity = sanitizeQuantity(sc.quantity, 100);
    const bidPrice = sanitizePrice(sc.bidPrice, 0);
    const transportCost = sanitizeNonNegativeNumber(sc.transportCost, 0);
    const loadingCost = sanitizeNonNegativeNumber(sc.loadingCost, 0);
    const otherCost = sanitizeNonNegativeNumber(sc.otherCost, 0);
    const unit = sc.unit || 'kg';

    const grossAmount = Math.round(bidPrice * quantity);
    const estimatedCosts = Math.round(transportCost + loadingCost + otherCost);
    const estimatedNetRealisation = Math.max(0, grossAmount - estimatedCosts);
    const netPerUnit =
      quantity > 0 ? Math.round((estimatedNetRealisation / quantity) * 100) / 100 : 0;

    const scenarioText = (sc.sellingScenario || '').toLowerCase();
    const isFutureScenario =
      scenarioText.includes('wait') ||
      scenarioText.includes('later') ||
      scenarioText.includes('future') ||
      scenarioText.includes('tomorrow') ||
      scenarioText.includes('days');

    return {
      id: sc.id || `scenario-${idx + 1}`,
      scenarioName: sc.scenarioName || `Scenario ${String.fromCharCode(65 + idx)}`,
      buyerId: sc.buyerId,
      buyerName: sc.buyerName || 'Selected Option',
      quantity,
      unit,
      bidPrice,
      transportCost,
      loadingCost,
      otherCost,
      sellingScenario: sc.sellingScenario || 'Current Offer',
      grossAmount,
      estimatedCosts,
      estimatedNetRealisation,
      netPerUnit,
      isFutureScenario,
      futureNote: isFutureScenario
        ? 'Future price information cannot be guaranteed. Market rates may rise or fall.'
        : null,
    };
  });

  return {
    scenarios: evaluated,
    disclaimer:
      'Simulated values are estimates for comparison only. Future market prices cannot be guaranteed. The final selling decision belongs to the farmer.',
  };
}

/**
 * Builds an Explainable AI Price Insight ("Why This Price?") showing ONLY factors actually present in current data.
 */
export function generateExplainablePriceInsight(
  input: ExplainablePriceInsightInput
): ExplainablePriceInsightResult {
  const cropName = (input.cropName || 'Produce').split('(')[0].trim();
  const unit = input.unit || 'kg';
  const factors: ExplainablePriceFactor[] = [];

  // 1. Current market price (only if available & > 0)
  if (input.currentMarketPrice && input.currentMarketPrice > 0) {
    factors.push({
      key: 'current_market_price',
      label: 'Current market price',
      value: `₹${sanitizePrice(input.currentMarketPrice)}/${unit}`,
      detail: input.localMarketName
        ? `Recorded modal rate at ${input.localMarketName}`
        : 'Available local market rate',
    });
  }

  // 2. Recent price trend (only if available)
  if (input.recentTrend || (input.marketMin && input.marketMax)) {
    const rangeStr =
      input.marketMin && input.marketMax
        ? `Prices have remained around ₹${sanitizePrice(input.marketMin)}–₹${sanitizePrice(input.marketMax)}/${unit}`
        : String(input.recentTrend);
    factors.push({
      key: 'recent_trend',
      label: 'Recent trend',
      value: rangeStr,
      detail:
        input.recentTrend && input.marketMin && input.marketMax
          ? `Trend direction: ${input.recentTrend}`
          : undefined,
    });
  }

  // 3. Historical prices (only if historical records exist)
  if (input.historicalSeriesCount && input.historicalSeriesCount > 0) {
    factors.push({
      key: 'historical_prices',
      label: 'Historical prices',
      value: `${input.historicalSeriesCount} recent market records`,
      detail: 'Recent mandi arrival price history available',
    });
  }

  // 4. Local market conditions (only if localMarketName is present)
  if (input.localMarketName) {
    factors.push({
      key: 'local_market_conditions',
      label: 'Local market conditions',
      value: input.localMarketName,
      detail: 'Regional mandi benchmark',
    });
  }

  // 5. Buyer demand (only if available)
  if (input.buyerDemand) {
    factors.push({
      key: 'buyer_demand',
      label: 'Buyer demand',
      value: input.buyerDemand,
      detail:
        input.nearbyOffersCount && input.nearbyOffersCount > 0
          ? `${input.nearbyOffersCount} active buyer offer(s) recorded`
          : undefined,
    });
  }

  // 6. Produce quantity (only if available & > 0)
  if (input.quantity && input.quantity > 0) {
    factors.push({
      key: 'produce_quantity',
      label: 'Your quantity',
      value: `${sanitizeQuantity(input.quantity)} ${unit}`,
    });
  }

  // 7. Produce quality (only if available)
  if (input.quality) {
    factors.push({
      key: 'produce_quality',
      label: 'Quality',
      value: input.quality,
    });
  }

  // 8. Location (only if available)
  if (input.location) {
    factors.push({
      key: 'location',
      label: 'Location',
      value: input.location,
    });
  }

  // 9. Recent buyer offers (only if actual offers exist)
  if (
    input.nearbyOffersMin &&
    input.nearbyOffersMax &&
    input.nearbyOffersMin > 0 &&
    input.nearbyOffersMax > 0
  ) {
    const offerStr =
      input.nearbyOffersMin === input.nearbyOffersMax
        ? `₹${sanitizePrice(input.nearbyOffersMin)}/${unit}`
        : `₹${sanitizePrice(input.nearbyOffersMin)}–₹${sanitizePrice(input.nearbyOffersMax)}/${unit}`;
    factors.push({
      key: 'nearby_offers',
      label: 'Nearby offers',
      value: offerStr,
      detail:
        input.nearbyOffersCount && input.nearbyOffersCount > 0
          ? `From ${input.nearbyOffersCount} verified buyer offer(s)`
          : undefined,
    });
  }

  const expectedMin =
    input.expectedMin && input.expectedMin > 0 ? sanitizePrice(input.expectedMin) : null;
  const expectedMax =
    input.expectedMax && input.expectedMax > 0 ? sanitizePrice(input.expectedMax) : null;

  const expectedRangeText =
    expectedMin && expectedMax
      ? `₹${expectedMin}–₹${expectedMax}/${unit}`
      : input.currentMarketPrice
      ? `Around ₹${sanitizePrice(input.currentMarketPrice)}/${unit}`
      : 'Limited data';

  const hasMarketData = Boolean(input.currentMarketPrice && input.currentMarketPrice > 0);
  const hasLimitedInformation = !hasMarketData || factors.length < 3;

  // Determine honest confidence level without inventing fake scores
  let confidence: string | null = null;
  if (input.confidence) {
    const c = String(input.confidence);
    if (c.toLowerCase().includes('high')) confidence = 'High';
    else if (c.toLowerCase().includes('medium')) confidence = 'Medium';
    else if (c.toLowerCase().includes('low')) confidence = 'Low';
    else confidence = c;
  } else if (hasMarketData && input.nearbyOffersCount && input.nearbyOffersCount > 0) {
    confidence = 'Medium';
  } else if (hasLimitedInformation) {
    confidence = 'Low (Limited Information)';
  } else {
    confidence = 'Medium';
  }

  return {
    cropName,
    unit,
    expectedRangeText,
    expectedMin,
    expectedMax,
    confidence,
    hasLimitedInformation,
    limitedInfoMessage: hasLimitedInformation
      ? 'Limited market information is available for this estimate.'
      : null,
    factors,
    disclaimer:
      'Estimated only — this is an AI-assisted price estimate based on available data, not a guaranteed selling price.',
  };
}
