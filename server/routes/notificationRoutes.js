import express from 'express';
import { verifyJWT } from '../middleware/auth.js';
import { 
    newNotification,
    getNotifications,
    getAllNotificationCount
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/new-notification', verifyJWT, newNotification);
router.post('/notifications', verifyJWT, getNotifications);
router.post('/all-notification-count', verifyJWT, getAllNotificationCount);

export default router;