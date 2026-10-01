import { Router } from 'express';
import { db } from '../../db/index.ts';
import { users, buyerProfiles, bids } from '../../db/schema.ts';
import { eq, desc } from 'drizzle-orm';
import { AuthRequest, requireAuth } from '../middleware/auth.ts';

const router = Router();

// GET /api/buyers - List buyers
router.get('/', async (req, res, next) => {
  try {
    const list = await db
      .select({
        id: users.id,
        uid: users.uid,
        name: users.name,
        phone: users.phone,
        email: users.email,
        businessName: buyerProfiles.businessName,
        village: buyerProfiles.village,
        district: buyerProfiles.district,
        state: buyerProfiles.state,
        buyerType: buyerProfiles.buyerType,
        createdAt: users.createdAt,
      })
      .from(users)
      .leftJoin(buyerProfiles, eq(users.id, buyerProfiles.userId))
      .where(eq(users.role, 'buyer'))
      .orderBy(desc(users.createdAt));

    res.json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/buyers/:id - Buyer details
router.get('/:id', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid buyer ID' });
    }

    // Server-side authorization check: Prevent URL parameter tampering
    if (req.user && req.user.role === 'buyer' && req.user.id !== id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You cannot access another buyer\'s private bids and profile data',
      });
    }

    const buyerRes = await db
      .select({
        id: users.id,
        uid: users.uid,
        name: users.name,
        phone: users.phone,
        email: users.email,
        businessName: buyerProfiles.businessName,
        village: buyerProfiles.village,
        district: buyerProfiles.district,
        state: buyerProfiles.state,
        buyerType: buyerProfiles.buyerType,
      })
      .from(users)
      .leftJoin(buyerProfiles, eq(users.id, buyerProfiles.userId))
      .where(eq(users.id, id))
      .limit(1);

    if (buyerRes.length === 0) {
      return res.status(404).json({ success: false, error: 'Buyer not found' });
    }

    const buyerBids = await db
      .select()
      .from(bids)
      .where(eq(bids.buyerId, id))
      .orderBy(desc(bids.createdAt));

    res.json({
      success: true,
      data: {
        ...buyerRes[0],
        bids: buyerBids,
      },
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/buyers/:id - Update buyer profile
router.put('/:id', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid buyer ID' });
    }

    // Only owner or admin can update
    if (req.user && req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You can only update your own buyer profile',
      });
    }

    const { name, phone, businessName, village, district, state, buyerType } = req.body;

    if (name || phone) {
      const userUpdates: Record<string, unknown> = { updatedAt: new Date() };
      if (name) userUpdates.name = name;
      if (phone) userUpdates.phone = phone;
      await db.update(users).set(userUpdates).where(eq(users.id, id));
    }

    if (businessName || village || district || state || buyerType) {
      const profileUpdates: Record<string, unknown> = { updatedAt: new Date() };
      if (businessName) profileUpdates.businessName = businessName;
      if (village) profileUpdates.village = village;
      if (district) profileUpdates.district = district;
      if (state) profileUpdates.state = state;
      if (buyerType) profileUpdates.buyerType = buyerType;

      await db
        .update(buyerProfiles)
        .set(profileUpdates)
        .where(eq(buyerProfiles.userId, id));
    }

    res.json({
      success: true,
      message: 'Buyer profile updated',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
