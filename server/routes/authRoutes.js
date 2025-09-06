import express from 'express';
import { verifyJWT } from '../middleware/auth.js';
import { 
    signup, 
    signin, 
    googleAuth, 
    forgotPassword, 
    resetPassword, 
    changePassword 
} from '../controllers/authcontroller.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/google-auth', googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', verifyJWT, changePassword);

export default router;