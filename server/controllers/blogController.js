import { nanoid } from 'nanoid';
import Blog from '../Schema/Blog.js';
import User from '../Schema/User.js';
import Notification from '../Schema/Notification.js';
import Comment from '../Schema/Comment.js';

export const createBlog = (req, res) => {
    let authorId = req.user;
    let { title, des, banner, tags, content, draft, id } = req.body;

    if (!title.length) {
        return res.status(403).json({ error: "You must provide a title to publish the blog" });
    }

    if (!draft) {
        if (!des.length || des.length > 200) {
            return res.status(403).json({ error: "You must provide blog description under 200 characters" });
        }
        if (!banner.length) {
            return res.status(403).json({ error: "You must provide blog banner to publish it" });
        }
        if (!content.blocks.length) {
            return res.status(403).json({ error: "There must be some blog content to publish it" });
        }
        if (!tags.length || tags.length > 10) {
            return res.status(403).json({ error: "Provide tags in order to publish blog, Maximum 10" });
        }
    }

    tags = tags.map(tag => tag.toLowerCase());

    let blog_id = id || title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, "-").trim() + nanoid();

    if (id) {
        Blog.findOneAndUpdate({ blog_id }, { title, des, banner, content, tags, draft: draft ? draft : false })
            .then(() => {
                return res.status(200).json({ id: blog_id });
            }).catch(err => {
                return res.status(500).json(err.message);
            })
    } else {
        let blog = new Blog({
            title, des, banner, content, tags, author: authorId, blog_id, draft: Boolean(draft)
        })

        blog.save().then(blog => {
            let incrementVal = draft ? 0 : 1;

            User.findOneAndUpdate({ _id: authorId }, { $inc: { "account_info.total_posts": incrementVal }, $push: { "blogs": blog._id } })
                .then(user => {
                    return res.status(200).json({ id: blog.blog_id })
                }).catch(err => {
                    return res.status(500).json({ error: "Failed to update total posts numbers" })
                })
        })
    }
};

export const getBlog = (req, res) => {
    let { blog_id, draft, mode } = req.body;
    let incrementVal = mode != 'edit' ? 1 : 0;

    Blog.findOneAndUpdate(
        { blog_id },
        { $inc: { "activity.total_reads": incrementVal } },
        { new: true }
    )
        .populate("author", "personal_info.fullname personal_info.username personal_info.profile_img")
        .select("title des content banner activity publishedAt blog_id tags")
        .then(blog => {
            User.findOneAndUpdate(
                { "personal_info.username": blog.author.personal_info.username },
                { $inc: { "account_info.total_reads": incrementVal } }
            )
                .catch(err => {
                    return res.status(500).json({ error: err.message })
                })
            if (blog.draft && !draft) {
                return res.status(500).json({ error: 'you can not access draft blogs' })
            }
            return res.status(200).json({ blog });
        })
        .catch(err => {
            return res.status(500).json({ error: err.message });
        })
};

export const getLatestBlogs = (req, res) => {
    let { page } = req.body;
    let maxLimit = 5;

    Blog.find({ draft: false })
        .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
        .sort({ "publishedAt": -1 })
        .select("blog_id title des banner activity tags publishedAt -_id")
        .skip((page - 1) * maxLimit)
        .limit(maxLimit)
        .then(blogs => {
            return res.status(200).json({ blogs })
        })
        .catch(err => {
            return res.status(500).json({ error: err.message })
        })
};

export const getAllLatestBlogsCount = (req, res) => {
    Blog.countDocuments({ draft: false })
        .then(count => {
            return res.status(200).json({ totalDocs: count })
        })
        .catch(err => {
            console.log(err.message);
            return res.status(500).json({ error: err.message })
        })
};

export const getTrendingBlogs = (req, res) => {
    Blog.find({ draft: false })
        .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
        .sort({ "activity.total_read": -1, "activity.total_likes": -1, "publishedAt": -1 })
        .select("blog_id title publishedAt -_id")
        .limit(5)
        .then(blogs => {
            return res.status(200).json({ blogs })
        })
        .catch(err => {
            return res.status(500).json({ error: err.message })
        })
};

export const searchBlogs = (req, res) => {
    let { tag, query, author, page, limit, eliminate_blog } = req.body;
    let findQuery;

    if (tag) {
        findQuery = { tags: tag, draft: false, blog_id: { $ne: eliminate_blog } };
    } else if (query) {
        findQuery = { draft: false, title: new RegExp(query, 'i') }
    } else if (author) {
        findQuery = { author, draft: false }
    }

    let maxLimit = limit ? limit : 2;

    Blog.find(findQuery)
        .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
        .sort({ "publishedAt": -1 })
        .select("blog_id title des banner activity tags publishedAt -_id")
        .skip((page - 1) * maxLimit)
        .limit(maxLimit)
        .then(blogs => {
            return res.status(200).json({ blogs })
        })
        .catch(err => {
            return res.status(500).json({ error: err.message })
        })
};

export const searchBlogsCount = (req, res) => {
    let { tag, query, author } = req.body;
    let findQuery;

    if (tag) {
        findQuery = { tags: tag, draft: false };
    } else if (query) {
        findQuery = { draft: false, title: new RegExp(query, 'i') }
    } else if (author) {
        findQuery = { author, draft: false }
    }

    Blog.countDocuments(findQuery)
        .then(count => {
            return res.status(200).json({ totalDocs: count })
        })
        .catch(err => {
            return res.status(500).json({ error: err.message })
        })
};

export const likeBlog = (req, res) => {
    let user_id = req.user;
    let { _id, islikedByUser } = req.body;
    let incrementVal = !islikedByUser ? 1 : -1;

    Blog.findOneAndUpdate({ _id }, { $inc: { "activity.total_likes": incrementVal } })
        .then(blog => {
            if (!islikedByUser) {
                let like = new Notification({
                    type: "like",
                    blog: _id,
                    notification_for: blog.author,
                    user: user_id
                })

                like.save().then(notification => {
                    return res.status(200).json({ liked_by_User: true })
                })
            } else {
                Notification.findOneAndDelete({ user: user_id, blog: _id, type: 'like' })
                    .then(data => {
                        return res.status(200).json({ liked_by_user: false })
                    }).catch(err => {
                        return res.status(500).json({ error: err.message });
                    })
            }
        })
};

export const isLikedByUser = (req, res) => {
    let user_id = req.user;
    let { _id } = req.body;

    Notification.exists({ user: user_id, type: 'like', blog: _id })
        .then(result => {
            return res.status(200).json({ result })
        })
        .catch(err => {
            return res.status(500).json({ error: err.message })
        })
};

export const getUserWrittenBlogs = (req, res) => {
    let user_id = req.user;
    let { page, draft, query, deletedDocCount } = req.body;

    let maxLimit = 5;
    let skipDocs = (page - 1) * maxLimit;

    if (deletedDocCount) {
        skipDocs -= deletedDocCount;
    }

    Blog.find({ author: user_id, draft, title: new RegExp(query, 'i') })
        .skip(skipDocs)
        .limit(maxLimit)
        .sort({ publishedAt: -1 })
        .select('title banner publishedAt blog_id activity des draft -_id')
        .then(blogs => {
            return res.status(200).json({ blogs })
        })
        .catch(err => {
            return res.status(500).json({ error: err.message })
        })
};

export const getUserWrittenBlogsCount = (req, res) => {
    let user_id = req.user;
    let { draft, query } = req.body;

    Blog.countDocuments({ author: user_id, draft, title: new RegExp(query, 'i') })
        .then(count => {
            return res.status(200).json({ totalDocs: count })
        })
        .catch(err => {
            console.log(err.message);
            return res.status(500).json({ error: err.message })
        })
};

export const deleteBlog = (req, res) => {
    let user_id = req.user;
    let { blog_id } = req.body;

    Blog.findOneAndDelete({ blog_id })
        .then(blog => {
            Notification.deleteMany({ blog: blog._id })
                .then(data => console.log('notification deleted'))

            Comment.deleteMany({ blog_id: blog._id }).then(data => console.log('commments deleted'))

            User.findOneAndUpdate({ _id: user_id }, { $pull: { blog: blog._id }, $inc: { "account_info.total_posts": -1 } })
                .then(user => console.log('Blog deleted'))

            return res.status(200).json({ status: 'done' })
        })
        .catch(err => {
            return res.status(500).json({ error: err.message })
        })
};

export const getAllBlogsCount = async (req, res) => {
  try {
    const totalBlogs = await Blog.countDocuments({ draft: false });
    res.json({ totalBlogs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllActiveWriters = async (req, res) => {
  try {
    const activeWriters = (await Blog.distinct('author', { draft: false })).length;
    res.json({ activeWriters });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};