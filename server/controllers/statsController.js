import Blog from '../Schema/Blog.js';

export const getTotalBlogsCount = async (req, res) => {
    try {
        const totalBlogs = await Blog.countDocuments({ draft: false });
        res.json({ totalBlogs });
    } catch (err) {
        console.error('Error in getTotalBlogsCount:', err);
        res.status(500).json({ error: "Failed to fetch total blogs count" });
    }
};

export const getYearlyStats = async (req, res) => {
    const year = parseInt(req.params.year);
    
    try {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31);

        // Get blogs count by month
        const monthlyData = await Blog.aggregate([
            {
                $match: {
                    publishedAt: { 
                        $gte: startDate, 
                        $lte: endDate 
                    },
                    draft: false
                }
            },
            {
                $group: {
                    _id: { $month: "$publishedAt" },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    month: {
                        $let: {
                            vars: {
                                months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                            },
                            in: { 
                                $arrayElemAt: ['$$months', { $subtract: ['$_id', 1] }] 
                            }
                        }
                    },
                    count: 1
                }
            },
            { $sort: { month: 1 } }
        ]);

        // Get tag distribution
        const tagCounts = await Blog.aggregate([
            {
                $match: {
                    publishedAt: { 
                        $gte: startDate, 
                        $lte: endDate 
                    },
                    draft: false
                }
            },
            { $unwind: "$tags" },
            {
                $group: {
                    _id: "$tags",
                    count: { $sum: 1 }
                }
            }
        ]).then(results => 
            results.reduce((acc, { _id, count }) => ({
                ...acc,
                [_id]: count
            }), {})
        );

        res.json({
            monthlyData,
            tagCounts
        });

    } catch (err) {
        console.error('Error in getYearlyStats:', err);
        res.status(500).json({ error: "Failed to fetch statistics" });
    }
};

export const getFilteredBlogs = async (req, res) => {
    const { year, tag } = req.query;
    
    try {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31);
        
        let query = {
            publishedAt: { 
                $gte: startDate, 
                $lte: endDate 
            },
            draft: false
        };

        if (tag && tag !== 'all') {
            query.tags = tag;
        }

        const blogs = await Blog.find(query)
            .populate('author', 'personal_info')
            .sort({ publishedAt: -1 });

        res.json({ blogs });
    } catch (err) {
        console.error('Error in getFilteredBlogs:', err);
        res.status(500).json({ error: "Failed to fetch filtered blogs" });
    }
};