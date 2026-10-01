import { Router } from 'express';
import { db } from '../../db/index.ts';
import { notifications } from '../../db/schema.ts';
import { eq, desc } from 'drizzle-orm';
import { AuthRequest } from '../middleware/auth.ts';

const router = Router();

// GET /api/notifications - List user's notifications
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.id;

    const list = await db
      .select()
      .from(notifications)
      .orderBy(desc(notifications.createdAt))
      .limit(30);

    let filtered = list;
    if (userId) {
      const userList = list.filter((n) => n.userId === userId);
      if (userList.length > 0) {
        filtered = userList;
      }
    }

    res.json({
      success: true,
      count: filtered.length,
      data: filtered,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid notification ID' });
    }

    const [updated] = await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id))
      .returning();

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/notifications/mark-all-read - Mark all notifications as read
router.post('/mark-all-read', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.id;
    if (userId) {
      await db
        .update(notifications)
        .set({ read: true })
        .where(eq(notifications.userId, userId));
    } else {
      await db.update(notifications).set({ read: true });
    }

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
