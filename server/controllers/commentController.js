import Comment from '../Schema/Comment.js';
import Blog from '../Schema/Blog.js';
import Notification from '../Schema/Notification.js';

export const addComment = async (req, res) => {
    let user_id = req.user;
    let { _id, comment, blog_author, replying_to, notification_id } = req.body;

    if (!comment.length) {
        return res.status(403).json({ error: "write something to leave a comment" });
    }

    // Create base comment object
    let commentObj = {
        blog_id: _id,
        blog_author,
        comment,
        commented_by: user_id,
        childrenLevel: 0 // Default for top-level comment
    };

    // Handle replies
    if (replying_to) {
        commentObj.parent = replying_to;
        commentObj.isReply = true;

        // Get parent comment to set childrenLevel
        const parentComment = await Comment.findById(replying_to);
        if (parentComment) {
            commentObj.childrenLevel = parentComment.childrenLevel + 1;
        }
    }

    // Save the comment
    new Comment(commentObj).save().then(async commentFile => {
        let { comment, commentedAt, children, childrenLevel } = commentFile;

        // Update blog document
        Blog.findOneAndUpdate(
            { _id },
            {
                $push: { "comments": commentFile._id },
                $inc: {
                    "activity.total_comments": 1,
                    "activity.total_parent_comments": replying_to ? 0 : 1
                }
            }
        ).then(blog => {
            console.log("new comment created");
        });

        // Create notification
        let notificationObj = {
            type: replying_to ? "reply" : "comment",
            blog: _id,
            notification_for: blog_author,
            user: user_id,
            comment: commentFile._id
        };

        // If it's a reply, update the parent comment
        if (replying_to) {
            notificationObj.replied_on_comment = replying_to;

            await Comment.findOneAndUpdate(
                { _id: replying_to },
                { $push: { children: commentFile._id } }
            ).then(replyingToCommentDoc => {
                notificationObj.notification_for = replyingToCommentDoc.commented_by;
            });

            if (notification_id) {
                await Notification.findOneAndUpdate(
                    { _id: notification_id },
                    { reply: commentFile._id }
                ).then(() => {
                    console.log("notification updated");
                });
            }
        }

        // Save the notification
        new Notification(notificationObj).save().then(() =>
            console.log("new notification created")
        );

        return res.status(200).json({
            comment,
            commentedAt,
            _id: commentFile._id,
            user_id,
            children,
            childrenLevel
        });
    }).catch(err => {
        console.error("Error saving comment:", err);
        res.status(500).json({ error: "Something went wrong." });
    });
};

export const getBlogComments = (req, res) => {
    let { blog_id, skip } = req.body;
    let maxLimit = 5;

    Comment.find({ blog_id, isReply: false })
        .populate("commented_by", "personal_info.username personal_info.fullname personal_info.profile_img")
        .skip(skip)
        .limit(maxLimit)
        .sort({
            'commentedAt': -1
        })
        .then(comment => {
            return res.status(200).json(comment);
        })
        .catch(err => {
            return res.status(500).json({ error: err.message })
        })
};

export const getReplies = (req, res) => {
    let { _id, skip } = req.body;
    let maxLimit = 5;

    Comment.findOne({ _id })
        .populate({
            path: "children",
            options: {
                limit: maxLimit,
                skip: skip,
                sort: { 'commentedAt': -1 }
            },
            populate: {
                path: 'commented_by',
                select: 'personal_info.profile_img personal_info.fullname personal_info.username'
            },
            select: "-blog_id -updatedAt"
        })
        .select("children")
        .then(doc => {
            return res.status(200).json({ replies: doc.children });
        })
        .catch(err => {
            return res.status(500).json({ error: err.message });
        })
};

const deleteComments = (_id) => {
    Comment.findOneAndDelete({ _id })
        .then(comment => {
            if (comment.parent) {
                Comment.findOneAndUpdate({ _id: comment.parent }, { $pull: { children: _id } })
                    .then(data => console.log('comment delete from parent'))
                    .catch(err => console.log(err));
            }
            Notification.findOneAndDelete({ comment: _id }).then(notification => console.log('comment notification deleted'))
            Notification.findOneAndUpdate({ reply: _id }, { $unset: { reply: 1 } }).then(notification => console.log('reply notification deleted'))
            Blog.findOneAndUpdate({ _id: comment.blog_id }, { $pull: { comments: _id }, $inc: { 'activity.total_comments': -1 }, 'activity.total_parent_comments': comment.parent ? 0 : -1 })
                .then(blog => {
                    if (comment.children.length) {
                        comment.children.map(replies => {
                            deleteComments(replies)
                        })
                    }
                })
        })
        .catch(err => {
            console.log(err.message);
        })
};

export const deleteComment = (req, res) => {
    let user_id = req.user;
    let { _id } = req.body;

    Comment.findOne({ _id })
        .then(comment => {
            if (user_id == comment.commented_by || user_id == comment.blog_author) {
                deleteComments(_id)
                return res.status(200).json({ status: 'done' });
            } else {
                return res.status(403).json({ error: 'You can not delete this comment' })
            }
        })
};