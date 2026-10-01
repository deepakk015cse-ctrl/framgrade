import { Router } from 'express';
import { db } from '../../db/index.ts';
import {
  bids,
  produceListings,
  users,
  crops,
  notifications,
  transactions,
  buyerProfiles,
} from '../../db/schema.ts';
import { eq, desc, and, ne } from 'drizzle-orm';
import { validateBody } from '../middleware/validate.ts';
import { AuthRequest } from '../middleware/auth.ts';
import { logger } from '../logger.ts';
import { realtimeHub } from '../services/realtimeHub.ts';

const router = Router();

// GET /api/bids/stream - Real-Time Server-Sent Events (SSE) stream for live bidding & dashboard sync
router.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  res.write(
    `data: ${JSON.stringify({
      event: 'connected',
      timestamp: new Date().toISOString(),
      recentEvents: realtimeHub.getRecentEvents(),
    })}\n\n`
  );

  realtimeHub.addClient(res);
});

// GET /api/bids/live-state - Authoritative real-time state from PostgreSQL database
router.get('/live-state', async (req: AuthRequest, res, next) => {
  try {
    const allListings = await db
      .select({
        listing: produceListings,
        crop: crops,
        farmer: {
          id: users.id,
          name: users.name,
          phone: users.phone,
        },
      })
      .from(produceListings)
      .innerJoin(crops, eq(produceListings.cropId, crops.id))
      .innerJoin(users, eq(produceListings.farmerId, users.id))
      .orderBy(desc(produceListings.createdAt));

    const allBids = await db
      .select({
        bid: bids,
        listing: produceListings,
        crop: crops,
        buyer: {
          id: users.id,
          name: users.name,
          phone: users.phone,
        },
        profile: buyerProfiles,
      })
      .from(bids)
      .innerJoin(produceListings, eq(bids.listingId, produceListings.id))
      .innerJoin(crops, eq(produceListings.cropId, crops.id))
      .innerJoin(users, eq(bids.buyerId, users.id))
      .leftJoin(buyerProfiles, eq(bids.buyerId, buyerProfiles.userId))
      .orderBy(desc(bids.createdAt));

    const allTxs = await db
      .select({
        tx: transactions,
        listing: produceListings,
        crop: crops,
        farmer: {
          id: users.id,
          name: users.name,
        },
      })
      .from(transactions)
      .innerJoin(produceListings, eq(transactions.listingId, produceListings.id))
      .innerJoin(crops, eq(produceListings.cropId, crops.id))
      .innerJoin(users, eq(transactions.farmerId, users.id))
      .orderBy(desc(transactions.createdAt));

    const allUsers = await db.select().from(users);
    const userMap = new Map(allUsers.map((u) => [u.id, u]));

    const formattedBids = allBids.map((item) => {
      const b = item.bid;
      const customBuyerMatch = b.notes?.match(/^\[BUYER:([^\]]+)\]\s*(.*)$/);
      const displayBuyerName = customBuyerMatch ? customBuyerMatch[1] : item.buyer.name;
      const cleanNotes = customBuyerMatch ? customBuyerMatch[2] : b.notes;
      const dist = b.distanceKm || (item.profile?.district === 'Salem' ? 10 : 8);
      const transportEstimate = b.pickupPreference?.toLowerCase().includes('farm gate')
        ? 0
        : dist * 25;

      return {
        id: b.id,
        listingId: b.listingId,
        farmerId: item.listing.farmerId,
        buyerId: b.buyerId,
        cropName: item.crop.name,
        unit: item.listing.unit,
        bidPrice: b.bidPrice,
        bidPricePerUnit: b.bidPrice,
        quantity: b.quantity,
        requestedQuantity: b.quantity,
        totalAmount: b.totalAmount,
        buyerName: displayBuyerName,
        buyerPhone: item.buyer.phone,
        buyerCompany: item.profile?.businessName || `${displayBuyerName}`,
        buyerType: b.buyerType || item.profile?.buyerType || 'Wholesaler',
        buyerLocation:
          b.buyerLocation ||
          (item.profile ? `${item.profile.village}, ${item.profile.district}` : 'Salem Market'),
        distanceKm: dist,
        transportCost: transportEstimate,
        otherCosts: 150,
        estimatedNetRealisation: Math.max(0, b.totalAmount - transportEstimate - 150),
        pickupPreference: b.pickupPreference || 'Buyer Pickup from Farm Gate',
        paymentTerms: b.paymentTerms || 'Immediate UPI',
        notes: cleanNotes,
        status: b.status,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      };
    });

    const formattedListings = allListings.map((r) => {
      const listingBids = formattedBids.filter((b) => b.listingId === r.listing.id);
      return {
        ...r.listing,
        cropName: r.crop.name,
        cropLocalName: r.crop.localName,
        cropCategory: r.crop.category,
        cropIcon: r.crop.icon,
        farmerName: r.farmer.name,
        farmerPhone: r.farmer.phone,
        bidsCount: listingBids.length,
      };
    });

    const formattedTransactions = allTxs.map((item) => ({
      ...item.tx,
      cropName: item.crop.name,
      unit: item.listing.unit,
      farmerName: item.farmer.name,
      buyerName: userMap.get(item.tx.buyerId)?.name || 'Verified Buyer',
    }));

    res.json({
      success: true,
      data: {
        listings: formattedListings,
        bids: formattedBids,
        transactions: formattedTransactions,
        liveActivity: realtimeHub.getRecentEvents(),
        buyerDemandCount: 5,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/bids - Place a new procurement bid
router.post(
  '/',
  validateBody([
    { field: 'listingId', type: 'number', required: true },
    { field: 'bidPrice', type: 'number', required: true, min: 1 },
    { field: 'quantity', type: 'number', required: true, min: 1 },
    { field: 'paymentTerms', type: 'string', required: true },
  ]),
  async (req: AuthRequest, res, next) => {
    try {
      const {
        listingId,
        bidPrice,
        quantity,
        pickupPreference,
        paymentTerms,
        notes,
        distanceKm,
        buyerLocation,
        buyerType,
        buyerNameOverride,
      } = req.body;
      const buyerId = req.user?.role === 'buyer' ? req.user.id : req.body.buyerId || 4;

      // Verify listing exists (or fall back to latest active listing if id is synthetic)
      let listingRes = await db
        .select({
          listing: produceListings,
          farmer: users,
          crop: crops,
        })
        .from(produceListings)
        .innerJoin(users, eq(produceListings.farmerId, users.id))
        .innerJoin(crops, eq(produceListings.cropId, crops.id))
        .where(eq(produceListings.id, listingId))
        .limit(1);

      if (listingRes.length === 0) {
        listingRes = await db
          .select({
            listing: produceListings,
            farmer: users,
            crop: crops,
          })
          .from(produceListings)
          .innerJoin(users, eq(produceListings.farmerId, users.id))
          .innerJoin(crops, eq(produceListings.cropId, crops.id))
          .orderBy(desc(produceListings.createdAt))
          .limit(1);
      }

      if (listingRes.length === 0) {
        return res.status(404).json({ success: false, error: 'Produce listing not found' });
      }

      const { listing, farmer, crop } = listingRes[0];
      const totalAmount = bidPrice * quantity;

      // Lookup buyer profile for verified distance, type, location if not provided
      const buyerProfileRes = await db
        .select()
        .from(buyerProfiles)
        .where(eq(buyerProfiles.userId, buyerId))
        .limit(1);

      const resolvedLocation =
        buyerLocation ||
        (buyerProfileRes[0]
          ? `${buyerProfileRes[0].village}, ${buyerProfileRes[0].district}`
          : 'Salem Market');
      const resolvedType =
        buyerType || (buyerProfileRes[0] ? buyerProfileRes[0].buyerType : 'Wholesaler');
      const resolvedDistance =
        distanceKm || (buyerProfileRes[0]?.district === 'Salem' ? 10 : 8);

      // Lookup buyer name
      const buyerUser = await db
        .select()
        .from(users)
        .where(eq(users.id, buyerId))
        .limit(1);
      const buyerName = buyerNameOverride || buyerUser[0]?.name || 'Verified Buyer';
      const storedNotes = buyerNameOverride
        ? `[BUYER:${buyerNameOverride}] ${notes || 'Live market bid'}`
        : notes || null;

      const [newBid] = await db
        .insert(bids)
        .values({
          listingId: listing.id,
          buyerId,
          bidPrice,
          quantity,
          totalAmount,
          distanceKm: resolvedDistance,
          buyerLocation: resolvedLocation,
          buyerType: resolvedType,
          pickupPreference: pickupPreference || 'Buyer Pickup from Farm Gate',
          paymentTerms: paymentTerms || 'Immediate UPI',
          notes: storedNotes,
          status: 'pending',
        })
        .returning();

      // Update listing status to negotiating
      await db
        .update(produceListings)
        .set({
          status: 'negotiating',
          updatedAt: new Date(),
        })
        .where(eq(produceListings.id, listing.id));

      // Notify the farmer (Requirement 4: "🔔 New buyer offer received.")
      await db.insert(notifications).values({
        userId: farmer.id,
        title: '🔔 New buyer offer received.',
        message: `${buyerName} (${resolvedDistance} km away) offered ₹${bidPrice}/${listing.unit} for ${quantity} ${listing.unit} ${crop.name}.`,
      });

      // Broadcast real-time event (Requirement 14: "🔔 New bid received — ₹27/kg")
      realtimeHub.recordAndBroadcast(
        {
          type: 'bid_placed',
          icon: '🔔',
          label: `🔔 New bid received — ₹${bidPrice}/${listing.unit}`,
          detail: `${buyerName} (${resolvedDistance} km away) offered ₹${bidPrice}/${listing.unit} for ${quantity} ${listing.unit} ${crop.name}`,
          listingId: listing.id,
          bidId: newBid.id,
          cropName: crop.name,
          pricePerKg: bidPrice,
          buyerName,
        },
        {
          bid: {
            ...newBid,
            buyerName,
            cropName: crop.name,
            unit: listing.unit,
          },
        }
      );

      logger.info('Bid placed successfully', {
        bidId: newBid.id,
        listingId: listing.id,
        buyerId,
        bidPrice,
      });

      res.status(201).json({
        success: true,
        message: 'Your bid has been submitted.',
        data: {
          ...newBid,
          buyerName,
          cropName: crop.name,
          farmerName: farmer.name,
          unit: listing.unit,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/bids/listing/:listingId - Compare all bids for a specific produce listing
router.get('/listing/:listingId', async (req, res, next) => {
  try {
    const listingId = parseInt(req.params.listingId, 10);
    if (isNaN(listingId)) {
      return res.status(400).json({ success: false, error: 'Invalid listing ID' });
    }

    const listingData = await db
      .select({
        listing: produceListings,
        crop: crops,
        farmer: users,
      })
      .from(produceListings)
      .innerJoin(crops, eq(produceListings.cropId, crops.id))
      .innerJoin(users, eq(produceListings.farmerId, users.id))
      .where(eq(produceListings.id, listingId))
      .limit(1);

    if (listingData.length === 0) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    const bidList = await db
      .select({
        bid: bids,
        buyer: users,
        profile: buyerProfiles,
      })
      .from(bids)
      .innerJoin(users, eq(bids.buyerId, users.id))
      .leftJoin(buyerProfiles, eq(bids.buyerId, buyerProfiles.userId))
      .where(eq(bids.listingId, listingId))
      .orderBy(desc(bids.bidPrice));

    const formattedBids = bidList.map((item) => {
      const b = item.bid;
      const u = item.buyer;
      const bp = item.profile;

      return {
        id: b.id,
        listingId: b.listingId,
        cropName: listingData[0].crop.name,
        unit: listingData[0].listing.unit,
        bidPrice: b.bidPrice,
        bidPricePerUnit: b.bidPrice,
        quantity: b.quantity,
        totalAmount: b.totalAmount,
        buyerId: b.buyerId,
        buyerName: u.name,
        buyerPhone: u.phone,
        buyerCompany: bp?.businessName || `${u.name} Agri Logistics`,
        buyerType: b.buyerType || bp?.buyerType || 'Wholesaler',
        buyerLocation: b.buyerLocation || (bp ? `${bp.village}, ${bp.district}` : 'Salem Market'),
        distanceKm: b.distanceKm || (bp?.district === 'Salem' ? 26 : 8),
        buyerRating: 4.8,
        pickupPreference: b.pickupPreference,
        offeredPickupDate: b.pickupPreference || 'Tomorrow morning',
        paymentTerms: b.paymentTerms,
        notes: b.notes,
        status: b.status,
        createdAt: b.createdAt,
      };
    });

    res.json({
      success: true,
      listing: {
        id: listingData[0].listing.id,
        cropName: listingData[0].crop.name,
        quantity: listingData[0].listing.quantity,
        unit: listingData[0].listing.unit,
        quality: listingData[0].listing.quality,
        status: listingData[0].listing.status,
        expectedPrice: listingData[0].listing.expectedPrice,
        farmerId: listingData[0].farmer.id,
        farmerName: listingData[0].farmer.name,
      },
      count: formattedBids.length,
      data: formattedBids,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/bids/:id/select - Farmer selects a buyer (Deal enters "Buyer Confirmation")
// User Requirement: Allow farmer to choose (do not force highest bid)
router.post('/:id/select', async (req: AuthRequest, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid bid ID' });
    }

    // Fetch bid, listing, farmer, buyer
    const bidRes = await db
      .select({
        bid: bids,
        listing: produceListings,
        buyer: users,
        crop: crops,
      })
      .from(bids)
      .innerJoin(produceListings, eq(bids.listingId, produceListings.id))
      .innerJoin(users, eq(bids.buyerId, users.id))
      .innerJoin(crops, eq(produceListings.cropId, crops.id))
      .where(eq(bids.id, id))
      .limit(1);

    if (bidRes.length === 0) {
      return res.status(404).json({ success: false, error: 'Bid not found' });
    }

    const { bid, listing, buyer, crop } = bidRes[0];
    const customBuyerMatch = bid.notes?.match(/^\[BUYER:([^\]]+)\]\s*(.*)$/);
    const displayBuyerName = customBuyerMatch ? customBuyerMatch[1] : buyer.name;

    // 1. Move bid to 'awaiting_buyer_confirmation'
    const [updatedBid] = await db
      .update(bids)
      .set({
        status: 'awaiting_buyer_confirmation',
        updatedAt: new Date(),
      })
      .where(eq(bids.id, id))
      .returning();

    // 2. Update listing status to 'negotiating'
    await db
      .update(produceListings)
      .set({
        status: 'negotiating',
        updatedAt: new Date(),
      })
      .where(eq(produceListings.id, listing.id));

    // 3. Create or update pending transaction record
    const [newTx] = await db
      .insert(transactions)
      .values({
        listingId: listing.id,
        farmerId: listing.farmerId,
        buyerId: buyer.id,
        bidId: bid.id,
        agreedPrice: bid.bidPrice,
        quantity: bid.quantity,
        totalAmount: bid.totalAmount,
        paymentStatus: 'pending',
        paymentMethod: bid.paymentTerms || 'Immediate UPI',
        status: 'awaiting_buyer_confirmation',
        selectedAt: new Date(),
      })
      .returning();

    // 4. Notifications (Requirement 4: Farmer: "✅ Buyer selected.", Buyer: "Your offer has been accepted.")
    await db.insert(notifications).values({
      userId: listing.farmerId,
      title: '✅ Buyer selected.',
      message: `You selected ${displayBuyerName} (₹${bid.bidPrice}/${listing.unit}). Awaiting buyer confirmation.`,
    });

    await db.insert(notifications).values({
      userId: buyer.id,
      title: 'Your offer has been accepted.',
      message: `Farmer selected your offer of ₹${bid.bidPrice}/${listing.unit} for ${listing.quantity} ${listing.unit} of ${crop.name}. Please confirm your purchase commitment.`,
    });

    realtimeHub.recordAndBroadcast(
      {
        type: 'bid_accepted',
        icon: '✅',
        label: `✅ Bid accepted — ₹${bid.bidPrice}/${listing.unit}`,
        detail: `Farmer selected ${displayBuyerName} at ₹${bid.bidPrice}/${listing.unit} for ${crop.name}`,
        listingId: listing.id,
        bidId: bid.id,
        cropName: crop.name,
        pricePerKg: bid.bidPrice,
        buyerName: displayBuyerName,
      },
      { bid: updatedBid, transaction: newTx }
    );

    logger.info('Farmer selected buyer', {
      bidId: id,
      buyerId: buyer.id,
      txId: newTx.id,
    });

    res.json({
      success: true,
      message: '✅ Buyer selected.',
      data: {
        bid: updatedBid,
        transaction: newTx,
        status: 'awaiting_buyer_confirmation',
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/bids/:id/reject - Farmer rejects a bid (Stored in history, notifies buyer "Your offer was not accepted.")
router.post('/:id/reject', async (req: AuthRequest, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid bid ID' });
    }

    const bidRes = await db
      .select({
        bid: bids,
        listing: produceListings,
        buyer: users,
        crop: crops,
      })
      .from(bids)
      .innerJoin(produceListings, eq(bids.listingId, produceListings.id))
      .innerJoin(users, eq(bids.buyerId, users.id))
      .innerJoin(crops, eq(produceListings.cropId, crops.id))
      .where(eq(bids.id, id))
      .limit(1);

    if (bidRes.length === 0) {
      return res.status(404).json({ success: false, error: 'Bid not found' });
    }

    const { bid, listing, buyer, crop } = bidRes[0];
    const customBuyerMatch = bid.notes?.match(/^\[BUYER:([^\]]+)\]\s*(.*)$/);
    const displayBuyerName = customBuyerMatch ? customBuyerMatch[1] : buyer.name;

    const [rejectedBid] = await db
      .update(bids)
      .set({
        status: 'rejected',
        updatedAt: new Date(),
      })
      .where(eq(bids.id, id))
      .returning();

    // Buyer notification (Requirement 4: "Your offer was not accepted.")
    await db.insert(notifications).values({
      userId: buyer.id,
      title: 'Your offer was not accepted.',
      message: `Your offer of ₹${bid.bidPrice}/${listing.unit} for ${crop.name} was not accepted by the farmer.`,
    });

    realtimeHub.recordAndBroadcast(
      {
        type: 'bid_rejected',
        icon: '⚠️',
        label: `⚠️ Offer declined — ₹${bid.bidPrice}/${listing.unit}`,
        detail: `${displayBuyerName}'s offer of ₹${bid.bidPrice}/${listing.unit} was not accepted`,
        listingId: listing.id,
        bidId: bid.id,
        cropName: crop.name,
        pricePerKg: bid.bidPrice,
        buyerName: displayBuyerName,
      },
      { bid: rejectedBid }
    );

    res.json({
      success: true,
      message: 'Your offer was not accepted.',
      data: rejectedBid,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/bids/:id/confirm-purchase - Buyer confirms commitment (Transaction becomes "Confirmed")
router.post('/:id/confirm-purchase', async (req: AuthRequest, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid bid ID' });
    }

    const bidRes = await db
      .select({
        bid: bids,
        listing: produceListings,
        buyer: users,
        crop: crops,
      })
      .from(bids)
      .innerJoin(produceListings, eq(bids.listingId, produceListings.id))
      .innerJoin(users, eq(bids.buyerId, users.id))
      .innerJoin(crops, eq(produceListings.cropId, crops.id))
      .where(eq(bids.id, id))
      .limit(1);

    if (bidRes.length === 0) {
      return res.status(404).json({ success: false, error: 'Bid not found' });
    }

    const { bid, listing, buyer, crop } = bidRes[0];
    const customBuyerMatch = bid.notes?.match(/^\[BUYER:([^\]]+)\]\s*(.*)$/);
    const displayBuyerName = customBuyerMatch ? customBuyerMatch[1] : buyer.name;

    // 1. Update Bid to 'confirmed'
    const [updatedBid] = await db
      .update(bids)
      .set({
        status: 'confirmed',
        updatedAt: new Date(),
      })
      .where(eq(bids.id, id))
      .returning();

    // 2. Generate digital weighment slip
    const slipNo = `FG-W${Math.floor(100 + Math.random() * 900)}-${Date.now().toString().slice(-4)}`;

    // 3. Update existing transaction or insert confirmed
    const existingTx = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.bidId, id), eq(transactions.status, 'awaiting_buyer_confirmation')))
      .limit(1);

    let confirmedTx;
    if (existingTx.length > 0) {
      const [tx] = await db
        .update(transactions)
        .set({
          status: 'confirmed',
          confirmedAt: new Date(),
          weighmentSlipNo: slipNo,
          paymentStatus: 'paid',
          updatedAt: new Date(),
        })
        .where(eq(transactions.id, existingTx[0].id))
        .returning();
      confirmedTx = tx;
    } else {
      const [tx] = await db
        .insert(transactions)
        .values({
          listingId: listing.id,
          farmerId: listing.farmerId,
          buyerId: buyer.id,
          bidId: bid.id,
          agreedPrice: bid.bidPrice,
          quantity: bid.quantity,
          totalAmount: bid.totalAmount,
          paymentStatus: 'paid',
          paymentMethod: bid.paymentTerms || 'Immediate UPI',
          weighmentSlipNo: slipNo,
          status: 'confirmed',
          confirmedAt: new Date(),
        })
        .returning();
      confirmedTx = tx;
    }

    // 4. Update produce listing status to 'sold'
    await db
      .update(produceListings)
      .set({
        status: 'sold',
        updatedAt: new Date(),
      })
      .where(eq(produceListings.id, listing.id));

    // 5. Notifications
    await db.insert(notifications).values({
      userId: listing.farmerId,
      title: '✅ Sale Confirmed!',
      message: `${displayBuyerName} confirmed purchase of ${listing.quantity} ${listing.unit} ${crop.name} at ₹${bid.bidPrice}/${listing.unit}. Receipt #${slipNo} recorded.`,
    });

    await db.insert(notifications).values({
      userId: buyer.id,
      title: 'Purchase Finalized & Confirmed',
      message: `Deal confirmed with Farmer. Digital weighment slip #${slipNo} issued. Dispatch ready.`,
    });

    realtimeHub.recordAndBroadcast(
      {
        type: 'sale_confirmed',
        icon: '✅',
        label: `✅ Sale confirmed — ₹${bid.bidPrice}/${listing.unit}`,
        detail: `${displayBuyerName} confirmed ${listing.quantity} ${listing.unit} ${crop.name} (Slip #${slipNo})`,
        listingId: listing.id,
        bidId: bid.id,
        cropName: crop.name,
        pricePerKg: bid.bidPrice,
        buyerName: displayBuyerName,
      },
      { bid: updatedBid, transaction: confirmedTx, weighmentSlipNo: slipNo }
    );

    logger.info('Buyer confirmed transaction', {
      bidId: id,
      slipNo,
      txId: confirmedTx?.id,
    });

    res.json({
      success: true,
      message: 'Transaction confirmed by buyer! Weighment slip generated.',
      data: {
        bid: updatedBid,
        transaction: confirmedTx,
        weighmentSlipNo: slipNo,
        status: 'confirmed',
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/bids/:id/cancel-selection
// Cancellation & Backup Buyer Flow (Requirements 4 & 18):
// When the selected buyer cancels:
// 1. Farmer notified: "⚠️ The selected buyer is no longer available."
// 2. Automatically identify the next eligible buyer according to backup-buyer rules
// 3. Mark backup bid as 'backup_offered' — Farmer MUST confirm before accepting the backup offer!
router.post('/:id/cancel-selection', async (req: AuthRequest, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid bid ID' });
    }

    const { reason = 'Selected buyer cancelled commitment' } = req.body;

    const bidRes = await db
      .select({
        bid: bids,
        listing: produceListings,
        buyer: users,
        crop: crops,
      })
      .from(bids)
      .innerJoin(produceListings, eq(bids.listingId, produceListings.id))
      .innerJoin(users, eq(bids.buyerId, users.id))
      .innerJoin(crops, eq(produceListings.cropId, crops.id))
      .where(eq(bids.id, id))
      .limit(1);

    if (bidRes.length === 0) {
      return res.status(404).json({ success: false, error: 'Bid not found' });
    }

    const { bid, listing, buyer, crop } = bidRes[0];
    const customBuyerMatch = bid.notes?.match(/^\[BUYER:([^\]]+)\]\s*(.*)$/);
    const displayBuyerName = customBuyerMatch ? customBuyerMatch[1] : buyer.name;

    // 1. Mark current bid as 'cancelled'
    const [cancelledBid] = await db
      .update(bids)
      .set({
        status: 'cancelled',
        updatedAt: new Date(),
      })
      .where(eq(bids.id, id))
      .returning();

    // 2. Mark existing transaction as 'cancelled'
    await db
      .update(transactions)
      .set({
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: reason,
        updatedAt: new Date(),
      })
      .where(and(eq(transactions.bidId, id), ne(transactions.status, 'confirmed')));

    // 3. Send Buyer Cancellation Notifications (Requirement 4: "⚠️ The selected buyer is no longer available.")
    await db.insert(notifications).values({
      userId: listing.farmerId,
      title: '⚠️ The selected buyer is no longer available.',
      message: `${displayBuyerName} cancelled their offer for ${crop.name}. Checking next eligible backup buyer...`,
    });

    await db.insert(notifications).values({
      userId: buyer.id,
      title: 'Deal Cancelled',
      message: `Your offer for ${crop.name} lot #${listing.id} was cancelled.`,
    });

    realtimeHub.recordAndBroadcast(
      {
        type: 'bid_cancelled',
        icon: '⚠️',
        label: '⚠️ Buyer cancelled',
        detail: `⚠️ The selected buyer (${displayBuyerName}) is no longer available.`,
        listingId: listing.id,
        bidId: bid.id,
        cropName: crop.name,
        buyerName: displayBuyerName,
      },
      { cancelledBid }
    );

    // 4. FIND NEXT ELIGIBLE BUYER (Pending bids on same listing, ordered by highest bidPrice)
    const eligibleBids = await db
      .select({
        bid: bids,
        buyer: users,
        profile: buyerProfiles,
      })
      .from(bids)
      .innerJoin(users, eq(bids.buyerId, users.id))
      .leftJoin(buyerProfiles, eq(bids.buyerId, buyerProfiles.userId))
      .where(and(eq(bids.listingId, listing.id), eq(bids.status, 'pending')))
      .orderBy(desc(bids.bidPrice))
      .limit(1);

    if (eligibleBids.length > 0) {
      const nextEligible = eligibleBids[0];
      const backupBid = nextEligible.bid;
      const backupBuyer = nextEligible.buyer;
      const backupCustomMatch = backupBid.notes?.match(/^\[BUYER:([^\]]+)\]\s*(.*)$/);
      const backupDisplayName = backupCustomMatch ? backupCustomMatch[1] : backupBuyer.name;

      // Mark next eligible buyer bid as 'backup_offered' so the Farmer can review & confirm it!
      // Requirement 4 & 18: "The farmer must confirm before accepting the backup offer. Do not automatically transfer the sale without farmer confirmation."
      const [updatedBackupBid] = await db
        .update(bids)
        .set({
          status: 'backup_offered',
          updatedAt: new Date(),
        })
        .where(eq(bids.id, backupBid.id))
        .returning();

      await db.insert(notifications).values({
        userId: listing.farmerId,
        title: '🔄 Backup buyer available',
        message: `Next eligible buyer identified: ${backupDisplayName} at ₹${backupBid.bidPrice}/${listing.unit}. Please confirm to accept this backup offer.`,
      });

      realtimeHub.recordAndBroadcast(
        {
          type: 'backup_available',
          icon: '🔄',
          label: `🔄 Backup buyer available — ₹${backupBid.bidPrice}/${listing.unit}`,
          detail: `${backupDisplayName} (₹${backupBid.bidPrice}/${listing.unit}) is ready as backup buyer. Waiting for farmer confirmation.`,
          listingId: listing.id,
          bidId: backupBid.id,
          cropName: crop.name,
          pricePerKg: backupBid.bidPrice,
          buyerName: backupDisplayName,
        },
        {
          backupBid: {
            ...updatedBackupBid,
            buyerName: backupDisplayName,
          },
        }
      );

      logger.info('Cancellation identified next eligible backup buyer awaiting farmer confirmation', {
        listingId: listing.id,
        cancelledBidId: id,
        newBackupBidId: backupBid.id,
        backupBuyerId: backupBuyer.id,
      });

      return res.json({
        success: true,
        message: '⚠️ The selected buyer is no longer available. Next eligible backup buyer identified for your confirmation.',
        cancelledBid,
        backupBuyerFound: true,
        requiresFarmerConfirmation: true,
        backupOffer: {
          bid: updatedBackupBid,
          buyerName: backupDisplayName,
          bidPrice: backupBid.bidPrice,
        },
      });
    } else {
      // No remaining eligible buyers -> Revert listing to open 'active' status
      await db
        .update(produceListings)
        .set({
          status: 'active',
          updatedAt: new Date(),
        })
        .where(eq(produceListings.id, listing.id));

      await db.insert(notifications).values({
        userId: listing.farmerId,
        title: 'Listing Re-opened for Bids',
        message: `No additional backup bids remaining for ${crop.name} lot #${listing.id}. The listing is now active in the open marketplace for new bids.`,
      });

      return res.json({
        success: true,
        message: '⚠️ The selected buyer is no longer available. Listing returned to active.',
        cancelledBid,
        backupBuyerFound: false,
      });
    }
  } catch (error) {
    next(error);
  }
});

// POST /api/bids/:id/confirm-backup - Farmer explicitly confirms the backup buyer offer
router.post('/:id/confirm-backup', async (req: AuthRequest, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid bid ID' });
    }

    const bidRes = await db
      .select({
        bid: bids,
        listing: produceListings,
        buyer: users,
        crop: crops,
      })
      .from(bids)
      .innerJoin(produceListings, eq(bids.listingId, produceListings.id))
      .innerJoin(users, eq(bids.buyerId, users.id))
      .innerJoin(crops, eq(produceListings.cropId, crops.id))
      .where(eq(bids.id, id))
      .limit(1);

    if (bidRes.length === 0) {
      return res.status(404).json({ success: false, error: 'Backup bid not found' });
    }

    const { bid, listing, buyer, crop } = bidRes[0];
    const customBuyerMatch = bid.notes?.match(/^\[BUYER:([^\]]+)\]\s*(.*)$/);
    const displayBuyerName = customBuyerMatch ? customBuyerMatch[1] : buyer.name;

    // Move backup bid to 'awaiting_buyer_confirmation'
    const [updatedBid] = await db
      .update(bids)
      .set({
        status: 'awaiting_buyer_confirmation',
        updatedAt: new Date(),
      })
      .where(eq(bids.id, id))
      .returning();

    // Create transaction record for backup buyer
    const [backupTx] = await db
      .insert(transactions)
      .values({
        listingId: listing.id,
        farmerId: listing.farmerId,
        buyerId: buyer.id,
        bidId: bid.id,
        agreedPrice: bid.bidPrice,
        quantity: bid.quantity,
        totalAmount: bid.totalAmount,
        paymentStatus: 'pending',
        paymentMethod: bid.paymentTerms || 'Immediate UPI',
        status: 'awaiting_buyer_confirmation',
        selectedAt: new Date(),
        backupOffersCount: 1,
      })
      .returning();

    await db.insert(notifications).values({
      userId: listing.farmerId,
      title: '✅ Backup Buyer Selected',
      message: `You confirmed backup buyer ${displayBuyerName} at ₹${bid.bidPrice}/${listing.unit}. Awaiting buyer confirmation.`,
    });

    await db.insert(notifications).values({
      userId: buyer.id,
      title: 'Your offer has been accepted.',
      message: `Farmer confirmed your backup offer of ₹${bid.bidPrice}/${listing.unit} for ${listing.quantity} ${listing.unit} ${crop.name}. Please confirm your purchase.`,
    });

    realtimeHub.recordAndBroadcast(
      {
        type: 'backup_confirmed',
        icon: '✅',
        label: `✅ Backup buyer confirmed — ₹${bid.bidPrice}/${listing.unit}`,
        detail: `Farmer confirmed backup offer from ${displayBuyerName} at ₹${bid.bidPrice}/${listing.unit}`,
        listingId: listing.id,
        bidId: bid.id,
        cropName: crop.name,
        pricePerKg: bid.bidPrice,
        buyerName: displayBuyerName,
      },
      { bid: updatedBid, transaction: backupTx }
    );

    res.json({
      success: true,
      message: '✅ Backup buyer selected. Awaiting buyer confirmation.',
      data: {
        bid: updatedBid,
        transaction: backupTx,
        status: 'awaiting_buyer_confirmation',
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/bids/timeline/:listingId - Fetch clear status timeline of competitive bidding workflow
router.get('/timeline/:listingId', async (req, res, next) => {
  try {
    const listingId = parseInt(req.params.listingId, 10);
    if (isNaN(listingId)) {
      return res.status(400).json({ success: false, error: 'Invalid listing ID' });
    }

    const listingRes = await db
      .select({
        listing: produceListings,
        crop: crops,
        farmer: users,
      })
      .from(produceListings)
      .innerJoin(crops, eq(produceListings.cropId, crops.id))
      .innerJoin(users, eq(produceListings.farmerId, users.id))
      .where(eq(produceListings.id, listingId))
      .limit(1);

    if (listingRes.length === 0) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    const { listing, crop, farmer } = listingRes[0];

    // Fetch all bids on this listing
    const allBids = await db
      .select({
        bid: bids,
        buyer: users,
        profile: buyerProfiles,
      })
      .from(bids)
      .innerJoin(users, eq(bids.buyerId, users.id))
      .leftJoin(buyerProfiles, eq(bids.buyerId, buyerProfiles.userId))
      .where(eq(bids.listingId, listingId))
      .orderBy(desc(bids.bidPrice));

    // Fetch transactions
    const txList = await db
      .select({
        tx: transactions,
        buyer: users,
      })
      .from(transactions)
      .innerJoin(users, eq(transactions.buyerId, users.id))
      .where(eq(transactions.listingId, listingId))
      .orderBy(desc(transactions.createdAt));

    // Determine current active stage
    const activeConfirmingBid = allBids.find(
      (b) => b.bid.status === 'awaiting_buyer_confirmation'
    );
    const confirmedBid = allBids.find(
      (b) => b.bid.status === 'confirmed' || b.bid.status === 'completed'
    );
    const cancelledBids = allBids.filter((b) => b.bid.status === 'cancelled');

    let currentStageIndex = 1; // 0: Created, 1: Bidding, 2: Selected, 3: Buyer Confirmation, 4: Confirmed
    if (confirmedBid) {
      currentStageIndex = 4;
    } else if (activeConfirmingBid) {
      currentStageIndex = 3;
    } else if (allBids.length > 0) {
      currentStageIndex = 1;
    }

    const timelineSteps = [
      {
        step: 1,
        title: 'Listing Created',
        description: `Farmer ${farmer.name} posted ${listing.quantity} ${listing.unit} of ${crop.name}`,
        status: 'completed',
        timestamp: listing.createdAt,
      },
      {
        step: 2,
        title: 'Bidding Active',
        description: `${allBids.length} verified buyers discovered listing and placed competitive bids`,
        status: allBids.length > 0 ? 'completed' : 'active',
        bidsCount: allBids.length,
      },
      {
        step: 3,
        title: 'Farmer Selected Buyer',
        description: activeConfirmingBid || confirmedBid
          ? `Farmer selected ${(activeConfirmingBid || confirmedBid)?.buyer.name} based on comprehensive terms`
          : 'Farmer is reviewing and comparing offers',
        status: activeConfirmingBid || confirmedBid ? 'completed' : allBids.length > 0 ? 'active' : 'pending',
        selectedBuyer: (activeConfirmingBid || confirmedBid)?.buyer.name,
      },
      {
        step: 4,
        title: 'Buyer Confirmation',
        description: activeConfirmingBid
          ? `Awaiting confirmation from ${activeConfirmingBid.buyer.name} (Backup buyer protection active)`
          : confirmedBid
          ? `Confirmed by ${confirmedBid.buyer.name}`
          : 'Pending buyer selection',
        status: activeConfirmingBid ? 'active' : confirmedBid ? 'completed' : 'pending',
        activeBuyer: activeConfirmingBid
          ? {
              id: activeConfirmingBid.bid.id,
              name: activeConfirmingBid.buyer.name,
              price: activeConfirmingBid.bid.bidPrice,
              phone: activeConfirmingBid.buyer.phone,
            }
          : null,
        cancellationsCount: cancelledBids.length,
      },
      {
        step: 5,
        title: 'Transaction Confirmed',
        description: confirmedBid
          ? `Deal sealed! Digital weighment slip generated and pickup scheduled.`
          : 'Pending buyer confirmation',
        status: confirmedBid ? 'completed' : 'pending',
        weighmentSlipNo: txList.find((t) => t.tx.status === 'confirmed')?.tx.weighmentSlipNo,
      },
    ];

    res.json({
      success: true,
      listingId,
      cropName: crop.name,
      currentStageIndex,
      activeBid: activeConfirmingBid?.bid || null,
      confirmedBid: confirmedBid?.bid || null,
      cancelledBidsCount: cancelledBids.length,
      steps: timelineSteps,
      transactions: txList.map((t) => t.tx),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/bids/received - Bids received by farmer
router.get('/received', async (req: AuthRequest, res, next) => {
  try {
    const list = await db
      .select({
        bid: bids,
        listing: produceListings,
        crop: crops,
        buyer: {
          id: users.id,
          name: users.name,
          phone: users.phone,
        },
        profile: buyerProfiles,
      })
      .from(bids)
      .innerJoin(produceListings, eq(bids.listingId, produceListings.id))
      .innerJoin(crops, eq(produceListings.cropId, crops.id))
      .innerJoin(users, eq(bids.buyerId, users.id))
      .leftJoin(buyerProfiles, eq(bids.buyerId, buyerProfiles.userId))
      .orderBy(desc(bids.createdAt));

    const formatted = list.map((item) => {
      const customBuyerMatch = item.bid.notes?.match(/^\[BUYER:([^\]]+)\]\s*(.*)$/);
      const displayBuyerName = customBuyerMatch ? customBuyerMatch[1] : item.buyer.name;
      const cleanNotes = customBuyerMatch ? customBuyerMatch[2] : item.bid.notes;
      return {
        ...item.bid,
        notes: cleanNotes,
        cropName: item.crop.name,
        cropIcon: item.crop.icon,
        unit: item.listing.unit,
        buyerName: displayBuyerName,
        buyerPhone: item.buyer.phone,
        buyerCompany: item.profile?.businessName || `${displayBuyerName}`,
        buyerType: item.bid.buyerType || item.profile?.buyerType || 'Wholesaler',
        buyerLocation:
          item.bid.buyerLocation ||
          (item.profile ? `${item.profile.village}, ${item.profile.district}` : 'Salem'),
        distanceKm: item.bid.distanceKm || (item.profile?.district === 'Salem' ? 10 : 8),
        buyerRating: 4.8,
      };
    });

    res.json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/bids/sent - Bids sent by buyer
router.get('/sent', async (req: AuthRequest, res, next) => {
  try {
    const list = await db
      .select({
        bid: bids,
        listing: produceListings,
        crop: crops,
        buyer: {
          id: users.id,
          name: users.name,
          phone: users.phone,
        },
        farmer: {
          id: users.id,
          name: users.name,
          phone: users.phone,
        },
      })
      .from(bids)
      .innerJoin(produceListings, eq(bids.listingId, produceListings.id))
      .innerJoin(crops, eq(produceListings.cropId, crops.id))
      .innerJoin(users, eq(produceListings.farmerId, users.id))
      .orderBy(desc(bids.createdAt));

    const formatted = list.map((item) => {
      const customBuyerMatch = item.bid.notes?.match(/^\[BUYER:([^\]]+)\]\s*(.*)$/);
      const displayBuyerName = customBuyerMatch ? customBuyerMatch[1] : 'Verified Buyer';
      const cleanNotes = customBuyerMatch ? customBuyerMatch[2] : item.bid.notes;
      return {
        ...item.bid,
        notes: cleanNotes,
        buyerName: displayBuyerName,
        cropName: item.crop.name,
        cropIcon: item.crop.icon,
        unit: item.listing.unit,
        farmerName: item.farmer.name,
        farmerPhone: item.farmer.phone,
        farmerVillage: item.listing.village,
      };
    });

    res.json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/bids/:id/status - Update bid status
router.put(
  '/:id/status',
  validateBody([
    {
      field: 'status',
      type: 'string',
      required: true,
      enum: [
        'pending',
        'selected',
        'awaiting_buyer_confirmation',
        'backup_offered',
        'confirmed',
        'accepted',
        'rejected',
        'countered',
        'cancelled',
        'completed',
      ],
    },
  ]),
  async (req: AuthRequest, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: 'Invalid bid ID' });
      }

      const { status } = req.body;

      const [updatedBid] = await db
        .update(bids)
        .set({
          status,
          updatedAt: new Date(),
        })
        .where(eq(bids.id, id))
        .returning();

      if (!updatedBid) {
        return res.status(404).json({ success: false, error: 'Bid not found' });
      }

      logger.info('Bid status updated', { bidId: id, newStatus: status });

      res.json({
        success: true,
        message: `Bid status updated to ${status}`,
        data: updatedBid,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
