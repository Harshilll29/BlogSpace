import express from 'express';
import { verifyJWT } from '../middleware/auth.js';
import { 
    createBlog,
    getBlog,
    getLatestBlogs,
    getAllLatestBlogsCount,
    getTrendingBlogs,
    searchBlogs,
    searchBlogsCount,
    likeBlog,
    isLikedByUser,
    getUserWrittenBlogs,
    getUserWrittenBlogsCount,
    deleteBlog
} from '../controllers/blogController.js';

const router = express.Router();

router.post('/create-blog', verifyJWT, createBlog);
router.post('/get-blog', getBlog);
router.post('/latest-blogs', getLatestBlogs);
router.post('/all-latest-blogs-count', getAllLatestBlogsCount);
router.get('/trending-blogs', getTrendingBlogs);
router.post('/search-blogs', searchBlogs);
router.post('/search-blogs-count', searchBlogsCount);
router.post('/like-blog', verifyJWT, likeBlog);
router.post('/isliked-by-user', verifyJWT, isLikedByUser);
router.post('/user-written-blogs', verifyJWT, getUserWrittenBlogs);
router.post('/user-written-blogs-count', verifyJWT, getUserWrittenBlogsCount);
router.post('/delete-blog', verifyJWT, deleteBlog);

export default router;