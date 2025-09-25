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
    deleteBlog,
    getAllBlogsCount,
    getAllActiveWriters
} from '../controllers/blogController.js';
import { getYearlyStats } from '../controllers/statsController.js';

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
router.get('/blogs/count', getAllBlogsCount);
router.get('/blogs/active-writers', getAllActiveWriters);
router.get('/stats/:year', getYearlyStats);

export default router;