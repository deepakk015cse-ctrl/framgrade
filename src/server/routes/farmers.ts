import { Router } from 'express';
import { db } from '../../db/index.ts';
import { users, farmerProfiles, produceListings } from '../../db/schema.ts';
import { eq, desc } from 'drizzle-orm';
import { AuthRequest, requireAuth } from '../middleware/auth.ts';

const router = Router();

// GET /api/farmers - List farmers
router.get('/', async (req, res, next) => {
  try {
    const list = await db
      .select({
        id: users.id,
        uid: users.uid,
        name: users.name,
        phone: users.phone,
        email: users.email,
        village: farmerProfiles.village,
        district: farmerProfiles.district,
        state: farmerProfiles.state,
        preferredLanguage: farmerProfiles.preferredLanguage,
        createdAt: users.createdAt,
      })
      .from(users)
      .leftJoin(farmerProfiles, eq(users.id, farmerProfiles.userId))
      .where(eq(users.role, 'farmer'))
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

// GET /api/farmers/:id - Single farmer profile with active listings
router.get('/:id', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid farmer ID' });
    }

    // Server-side authorization check: Prevent URL parameter tampering
    if (req.user && req.user.role === 'farmer' && req.user.id !== id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You cannot access another farmer\'s private profile data',
      });
    }

    const farmerRes = await db
      .select({
        id: users.id,
        uid: users.uid,
        name: users.name,
        phone: users.phone,
        email: users.email,
        village: farmerProfiles.village,
        district: farmerProfiles.district,
        state: farmerProfiles.state,
        preferredLanguage: farmerProfiles.preferredLanguage,
      })
      .from(users)
      .leftJoin(farmerProfiles, eq(users.id, farmerProfiles.userId))
      .where(eq(users.id, id))
      .limit(1);

    if (farmerRes.length === 0) {
      return res.status(404).json({ success: false, error: 'Farmer not found' });
    }

    const listings = await db
      .select()
      .from(produceListings)
      .where(eq(produceListings.farmerId, id))
      .orderBy(desc(produceListings.createdAt));

    res.json({
      success: true,
      data: {
        ...farmerRes[0],
        listings,
      },
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/farmers/:id - Update farmer profile
router.put('/:id', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid farmer ID' });
    }

    // Only owner or admin can update
    if (req.user && req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You can only update your own farmer profile',
      });
    }

    const { name, phone, village, district, state, preferredLanguage } = req.body;

    if (name || phone) {
      const userUpdates: Record<string, unknown> = { updatedAt: new Date() };
      if (name) userUpdates.name = name;
      if (phone) userUpdates.phone = phone;
      await db.update(users).set(userUpdates).where(eq(users.id, id));
    }

    if (village || district || state || preferredLanguage) {
      const profileUpdates: Record<string, unknown> = { updatedAt: new Date() };
      if (village) profileUpdates.village = village;
      if (district) profileUpdates.district = district;
      if (state) profileUpdates.state = state;
      if (preferredLanguage) profileUpdates.preferredLanguage = preferredLanguage;

      await db
        .update(farmerProfiles)
        .set(profileUpdates)
        .where(eq(farmerProfiles.userId, id));
    }

    res.json({
      success: true,
      message: 'Farmer profile updated',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
