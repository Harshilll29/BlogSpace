import express from 'express';
import { getTotalBlogsCount, getYearlyStats, getFilteredBlogs } from '../controllers/statsController.js'; // make sure filepath/name is correct

const router = express.Router();

router.get('/blogs/total-count', getTotalBlogsCount);
router.get('/stats/:year', getYearlyStats);
router.get('/blogs/filter', getFilteredBlogs);

export default router;
