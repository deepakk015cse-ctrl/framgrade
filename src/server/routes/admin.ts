import { Router } from 'express';
import { db } from '../../db/index.ts';
import { users, produceListings, bids, transactions, marketPrices, notifications, crops } from '../../db/schema.ts';
import { sql, desc, eq } from 'drizzle-orm';
import { AuthRequest } from '../middleware/auth.ts';
import { realtimeHub } from '../services/realtimeHub.ts';

const router = Router();

// In-memory store for reported / flagged problematic records
interface ProblematicRecord {
  id: number;
  type: 'listing' | 'bid' | 'buyer' | 'farmer';
  targetId: number;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  reportedAt: string;
  flaggedBy: string;
}

const mockReportedRecords: ProblematicRecord[] = [
  {
    id: 1,
    type: 'bid',
    targetId: 3,
    reason: 'Unusually low bid price (-40% vs regional mandi average)',
    status: 'pending',
    reportedAt: new Date(Date.now() - 3600000).toISOString(),
    flaggedBy: 'Automated Price Anomaly Guard',
  },
  {
    id: 2,
    type: 'listing',
    targetId: 2,
    reason: 'Quantity discrepancy reported during weighment check',
    status: 'pending',
    reportedAt: new Date(Date.now() - 7200000).toISOString(),
    flaggedBy: 'Oddanchatram Kiosk Weighment Station',
  },
];

// GET /api/admin/metrics - Platform statistics & real-time chart datasets from PostgreSQL
router.get('/metrics', async (req, res, next) => {
  try {
    const allUsers = await db.select().from(users);
    const farmersList = allUsers.filter((u) => u.role === 'farmer');
    const buyersList = allUsers.filter((u) => u.role === 'buyer');

    const allCrops = await db.select().from(crops);
    const cropMap = new Map(allCrops.map((c) => [c.id, c.name]));

    const allListings = await db.select().from(produceListings).orderBy(desc(produceListings.createdAt));
    const activeListings = allListings.filter((l) => l.status === 'active' || l.status === 'negotiating');

    const allBids = await db.select().from(bids).orderBy(desc(bids.createdAt));
    const liveBids = allBids.filter(
      (b) => b.status === 'pending' || b.status === 'awaiting_buyer_confirmation' || b.status === 'backup_offered'
    );
    const acceptedBids = allBids.filter(
      (b) => b.status === 'accepted' || b.status === 'confirmed' || b.status === 'completed' || b.status === 'awaiting_buyer_confirmation'
    );

    const allTxs = await db.select().from(transactions).orderBy(desc(transactions.createdAt));
    const completedSales = allTxs.filter((tx) => tx.status === 'confirmed' || tx.status === 'completed');
    const totalVolumeAmount = completedSales.reduce((sum, tx) => sum + tx.totalAmount, 0);

    const allMarketPrices = await db.select().from(marketPrices);

    // Build real database chart series:
    // 1. Crop-wise listings
    const cropCounts: Record<string, { crop: string; count: number; totalKg: number }> = {};
    for (const l of allListings) {
      const cName = cropMap.get(l.cropId) || `Crop #${l.cropId}`;
      if (!cropCounts[cName]) {
        cropCounts[cName] = { crop: cName, count: 0, totalKg: 0 };
      }
      cropCounts[cName].count += 1;
      cropCounts[cName].totalKg += l.quantity;
    }

    // 2. Transaction & Bid status distribution
    const transactionStatusBreakdown = [
      { status: 'Pending Bids', count: allBids.filter((b) => b.status === 'pending').length },
      {
        status: 'Awaiting Confirmation',
        count: allBids.filter((b) => b.status === 'awaiting_buyer_confirmation' || b.status === 'backup_offered').length,
      },
      {
        status: 'Accepted / Confirmed',
        count: allBids.filter((b) => b.status === 'accepted' || b.status === 'confirmed' || b.status === 'completed').length,
      },
      { status: 'Rejected', count: allBids.filter((b) => b.status === 'rejected').length },
      { status: 'Cancelled', count: allBids.filter((b) => b.status === 'cancelled').length },
    ];

    // 3. Market-price trends from DB marketPrices
    const marketPriceTrends = allMarketPrices.map((mp) => ({
      crop: cropMap.get(mp.cropId) || `Crop #${mp.cropId}`,
      location: mp.location,
      minPrice: mp.minPrice || mp.price - 2,
      modalPrice: mp.price,
      maxPrice: mp.maxPrice || mp.price + 2,
      trend: mp.trend || 'stable',
      changePercent: mp.changePercent || '0%',
    }));

    // 4. Listings over time & Bids over time grouped by date
    const listingsByDateMap: Record<string, number> = {};
    for (const l of allListings) {
      const d = new Date(l.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      listingsByDateMap[d] = (listingsByDateMap[d] || 0) + 1;
    }
    const listingsOverTime = Object.entries(listingsByDateMap).map(([date, count]) => ({ date, count }));

    const bidsByDateMap: Record<string, { date: string; count: number; avgPrice: number; sumPrice: number }> = {};
    for (const b of allBids) {
      const d = new Date(b.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      if (!bidsByDateMap[d]) {
        bidsByDateMap[d] = { date: d, count: 0, avgPrice: 0, sumPrice: 0 };
      }
      bidsByDateMap[d].count += 1;
      bidsByDateMap[d].sumPrice += b.bidPrice;
      bidsByDateMap[d].avgPrice = Math.round(bidsByDateMap[d].sumPrice / bidsByDateMap[d].count);
    }
    const bidsOverTime = Object.values(bidsByDateMap);

    const userMap = new Map(allUsers.map((u) => [u.id, u]));

    res.json({
      success: true,
      data: {
        totalFarmers: farmersList.length,
        totalBuyers: buyersList.length,
        totalListings: allListings.length,
        activeListingsCount: activeListings.length,
        totalBids: allBids.length,
        pendingBidsCount: liveBids.length,
        acceptedBidsCount: acceptedBids.length,
        settledTransactionsCount: completedSales.length,
        grossTransactedValue: totalVolumeAmount,
        currency: 'INR',
        charts: {
          listingsOverTime,
          bidsOverTime,
          cropWiseListings: Object.values(cropCounts),
          marketPriceTrends,
          transactionStatus: transactionStatusBreakdown,
        },
        farmers: farmersList.map((f) => ({
          id: f.id,
          name: f.name,
          phone: f.phone,
          email: f.email,
          createdAt: f.createdAt,
        })),
        buyers: buyersList.map((b) => ({
          id: b.id,
          name: b.name,
          phone: b.phone,
          email: b.email,
          createdAt: b.createdAt,
        })),
        listings: allListings.map((l) => ({
          ...l,
          cropName: cropMap.get(l.cropId) || 'Produce',
          farmerName: userMap.get(l.farmerId)?.name || `Farmer #${l.farmerId}`,
        })),
        bids: allBids.map((b) => ({
          ...b,
          buyerName: userMap.get(b.buyerId)?.name || `Buyer #${b.buyerId}`,
        })),
        transactions: allTxs.map((tx) => ({
          ...tx,
          farmerName: userMap.get(tx.farmerId)?.name || `Farmer #${tx.farmerId}`,
          buyerName: userMap.get(tx.buyerId)?.name || `Buyer #${tx.buyerId}`,
        })),
        liveActivity: realtimeHub.getRecentEvents(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/activity - System activity audit stream
router.get('/activity', async (req, res, next) => {
  try {
    const recentListings = await db
      .select()
      .from(produceListings)
      .orderBy(desc(produceListings.createdAt))
      .limit(5);

    const recentBids = await db
      .select()
      .from(bids)
      .orderBy(desc(bids.createdAt))
      .limit(5);

    const recentTxs = await db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.createdAt))
      .limit(5);

    const activities = [
      ...recentListings.map((l) => ({
        id: `act-lst-${l.id}`,
        type: 'listing_created',
        title: 'New Produce Listed',
        details: `Farmer #${l.farmerId} listed ${l.quantity} ${l.unit} in ${l.village}`,
        timestamp: l.createdAt,
        status: l.status,
      })),
      ...recentBids.map((b) => ({
        id: `act-bid-${b.id}`,
        type: 'bid_placed',
        title: 'Procurement Bid Placed',
        details: `Buyer #${b.buyerId} offered ₹${b.bidPrice} for listing #${b.listingId}`,
        timestamp: b.createdAt,
        status: b.status,
      })),
      ...recentTxs.map((t) => ({
        id: `act-tx-${t.id}`,
        type: 'transaction_settled',
        title: 'Transaction Confirmed',
        details: `Deal of ₹${t.totalAmount} confirmed between Farmer #${t.farmerId} & Buyer #${t.buyerId}`,
        timestamp: t.createdAt,
        status: t.status,
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/reports - Manage reported / problematic records
router.get('/reports', (req, res) => {
  res.json({
    success: true,
    count: mockReportedRecords.length,
    data: mockReportedRecords,
  });
});

// PUT /api/admin/records/:type/:id/moderate - Moderate / resolve reported records
router.put('/records/:type/:id/moderate', async (req: AuthRequest, res, next) => {
  try {
    const { type, id } = req.params;
    const { action, resolutionNotes } = req.body; // action: 'approve' | 'archive' | 'flag'

    const targetId = parseInt(id, 10);

    if (type === 'listing' && action === 'archive') {
      await db
        .update(produceListings)
        .set({ status: 'archived', updatedAt: new Date() })
        .where(eq(produceListings.id, targetId));
    } else if (type === 'bid' && action === 'archive') {
      await db
        .update(bids)
        .set({ status: 'cancelled', updatedAt: new Date() })
        .where(eq(bids.id, targetId));
    }

    // Mark in reported records list
    const foundReport = mockReportedRecords.find((r) => r.type === type && r.targetId === targetId);
    if (foundReport) {
      foundReport.status = 'resolved';
    }

    res.json({
      success: true,
      message: `Record ${type} #${id} moderated successfully (${action})`,
      resolutionNotes,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/health - Database connectivity
router.get('/health', async (req, res, next) => {
  try {
    const dbTest = await db.execute(sql`SELECT current_database(), current_user, version()`);
    res.json({
      success: true,
      status: 'healthy',
      database: 'connected (PostgreSQL / Cloud SQL)',
      timestamp: new Date().toISOString(),
      details: dbTest.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

export default router;
