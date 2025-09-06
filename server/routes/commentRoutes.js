import express from 'express';
import { verifyJWT } from '../middleware/auth.js';
import { 
    addComment,
    getBlogComments,
    getReplies,
    deleteComment
} from '../controllers/commentController.js';

const router = express.Router();

router.post('/add-comment', verifyJWT, addComment);
router.post('/get-blog-comments', getBlogComments);
router.post('/get-replies', getReplies);
router.post('/delete-comment', verifyJWT, deleteComment);

export default router;