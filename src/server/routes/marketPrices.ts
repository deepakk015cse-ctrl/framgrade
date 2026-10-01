import { Router } from 'express';
import { db } from '../../db/index.ts';
import { marketPrices, crops } from '../../db/schema.ts';
import { eq, desc } from 'drizzle-orm';

const router = Router();

// GET /api/market-prices - List current mandi benchmarks
router.get('/', async (req, res, next) => {
  try {
    const list = await db
      .select({
        id: marketPrices.id,
        cropId: marketPrices.cropId,
        cropName: crops.name,
        cropLocalName: crops.localName,
        cropIcon: crops.icon,
        location: marketPrices.location,
        price: marketPrices.price,
        minPrice: marketPrices.minPrice,
        maxPrice: marketPrices.maxPrice,
        unit: marketPrices.unit,
        source: marketPrices.source,
        trend: marketPrices.trend,
        changePercent: marketPrices.changePercent,
        recordedAt: marketPrices.recordedAt,
      })
      .from(marketPrices)
      .innerJoin(crops, eq(marketPrices.cropId, crops.id))
      .orderBy(desc(marketPrices.recordedAt));

    res.json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/market-prices/:crop - Specific crop prices across mandis
router.get('/:crop', async (req, res, next) => {
  try {
    const cropParam = req.params.crop.toLowerCase();

    const list = await db
      .select({
        id: marketPrices.id,
        cropId: marketPrices.cropId,
        cropName: crops.name,
        cropLocalName: crops.localName,
        cropIcon: crops.icon,
        location: marketPrices.location,
        price: marketPrices.price,
        minPrice: marketPrices.minPrice,
        maxPrice: marketPrices.maxPrice,
        unit: marketPrices.unit,
        source: marketPrices.source,
        trend: marketPrices.trend,
        changePercent: marketPrices.changePercent,
        recordedAt: marketPrices.recordedAt,
      })
      .from(marketPrices)
      .innerJoin(crops, eq(marketPrices.cropId, crops.id));

    const matches = list.filter(
      (item) =>
        item.cropName.toLowerCase() === cropParam ||
        (item.cropLocalName && item.cropLocalName.toLowerCase().includes(cropParam))
    );

    if (matches.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No market price records found for crop '${req.params.crop}'`,
      });
    }

    res.json({
      success: true,
      crop: req.params.crop,
      data: matches,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
