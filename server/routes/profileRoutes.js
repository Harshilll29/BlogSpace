import express from 'express';
import { verifyJWT } from '../middleware/auth.js';
import { 
    getProfile,
    updateProfileImg,
    updateProfile,
    searchUsers
} from '../controllers/profileController.js';

const router = express.Router();

router.post('/get-profile', getProfile);
router.post('/update-profile-img', verifyJWT, updateProfileImg);
router.post('/update-profile', verifyJWT, updateProfile);
router.post('/search-users', searchUsers);

export default router;