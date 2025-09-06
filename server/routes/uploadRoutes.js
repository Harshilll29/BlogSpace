import express from 'express';
import { authenticateUser } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { 
    uploadBanner,
    uploadBlogImage,
    serveMedia
} from '../controllers/uploadController.js';

const router = express.Router();

router.post('/upload-banner', authenticateUser, upload.single('image'), uploadBanner);
router.post('/upload-blog-image', upload.single('image'), uploadBlogImage);
router.get('/media/:filename', serveMedia);

export default router;