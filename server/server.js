import express from 'express';
import mongoose from 'mongoose';
const app = express();
const port = 3000;
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import admin from 'firebase-admin';
import { createRequire } from 'module';
import { getAuth } from 'firebase-admin/auth';
import multer from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage';
import { GridFSBucket } from 'mongodb';
import nodemailer from 'nodemailer';
import crypto from 'crypto';


const require = createRequire(import.meta.url);
const serviceAccountKey = require('./blog-app-7363a-firebase-adminsdk-fbsvc-c75eac95a0.json');

//schema
import User from './Schema/User.js';
import Blog from './Schema/Blog.js';
import Notification from './Schema/Notification.js';
import Comment from './Schema/Comment.js';


import { error } from 'console';
import { verify } from 'crypto';

app.use(express.json());

app.use(cors());

admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey)
})

const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

mongoose.connect(process.env.DB_LOCATION, {
    autoIndex: true
})


//middleware
const verifyJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) {
        return res.status(401).json({ error: "No access token" })
    }
    jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Access token is invilid" })
        }
        req.user = user.id;
        next()
    })
}


const formateDatatoSend = (user) => {

    const access_token = jwt.sign({ id: user._id }, process.env.SECRET_ACCESS_KEY)

    return {
        access_token,
        profile_img: user.personal_info.profile_img,
        username: user.personal_info.username,
        fullname: user.personal_info.fullname
    }
}

const generateUsername = async (email) => {
    let username = email.split("@")[0];

    let isUsernameExists = await User.exists({ "personal_info.username": username }).then((result) => result)

    isUsernameExists ? username += nanoid().substring(0, 5) : "";

    return username;
}


function authenticateUser(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token provided" });
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ error: "Invalid token" });
        req.user = decoded; // decoded.id is the user id
        next();
    });
}

// GridFS storage setup
const storage = new GridFsStorage({
    url: process.env.DB_LOCATION,
    file: (req, file) => ({
        filename: Date.now() + '-' + file.originalname,
        bucketName: 'uploads',
    }),
});
const upload = multer({ storage });

// Upload endpoint for blog banner
app.post('/upload-banner', authenticateUser, upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ filename: req.file.filename });
});

// Serve image endpoint
app.get('/image/:filename', async (req, res) => {
    try {
        const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
        const stream = bucket.openDownloadStreamByName(req.params.filename);
        stream.on('error', () => res.status(404).send('Not found'));
        stream.pipe(res);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



app.post('/signup', (req, res) => {
    const { fullname, email, password, confirmPassword } = req.body;

    if (!fullname.length) {
        return res.status(403).json({ "error": "Enter Fullname" })
    }

    if (fullname.length < 3) {
        return res.status(403).json({ "error": "Fullname must be atleast 3 letters long" })
    }
    if (!email.length) {
        return res.status(403).json({
            "error": "Enter Email"
        })
    }
    if (!emailRegex.test(email)) {
        return res.status(403).json({
            "error": "Email Is Invalid!"
        })
    }
    if (!passwordRegex.test(password)) {
        return res.status(403).json({
            "error": "Password should be 6 to 20 characters long with one numeric, one lowercase and one uppercase letters"
        })
    }
    if (confirmPassword !== password) {
        return res.status(403).json({
            "error": "Password dosen't match!"
        })
    }

    bcrypt.hash(password, 10, async (err, hashed_password) => {

        let username = await generateUsername(email);

        const user = new User({
            personal_info: { fullname, email, password: hashed_password, username }
        })

        user.save().then((u) => {
            return res.status(200).json(
                formateDatatoSend(u)
            )
        })
            .catch(err => {

                if (err.code == 11000) {
                    return res.status(500).json({
                        "error": "Email already exists"
                    })
                }

                return res.status(500).json({
                    "error": err.message
                })
            })
    })
})


app.post('/signin', (req, res) => {
    const { email, password } = req.body;

    User.findOne({
        "personal_info.email": email
    }).then((user) => {
        if (!user) {
            return res.status(403).json({
                "error": "Email not found"
            })
        }
        if (!user.google_auth) {
            bcrypt.compare(password, user.personal_info.password, (err, result) => {
                if (err) {
                    return res.status(403).json({
                        "error": "Error occured while login please try again"
                    })
                }
                if (!result) {
                    return res.status(403).json({
                        "error": "Incorrect Password"
                    })
                } else {
                    return res.status(200).json(formateDatatoSend(user));
                }
            })
        }
        else {
            return res.status(403).json({ "error": "Account was created using google. Try logging in with google." })
        }

    }).catch(err => {
        console.log(err.message);
        return res.status(500).json({
            "error": err.message
        })
    })

})


app.post('/google-auth', async (req, res) => {
    let { access_token } = req.body;

    getAuth()
        .verifyIdToken(access_token)
        .then(async (decodecUser) => {

            let { email, name, picture } = decodecUser;

            picture = picture.replace("s96-c", "s384-c");

            let user = await User.findOne({ "personal_info.email": email }).select("personal_info.fullname personal_info.username personal_info.profile_img google_auth").then((u) => {
                return u || null
            })
                .catch(err => {
                    return res.status(500).json({ "error": err.message });
                })
            if (user) {//login
                if (!user.google_auth) {
                    return res.status(403).json({ "error": "This email was signed up without google. Please log in with password to access the account" })
                }
            } else {//signup

                let username = await generateUsername(email);

                user = new User({
                    personal_info: { fullname: name, email, username },
                    google_auth: true
                })
                await user.save().then((u) => {
                    user = u;
                }).catch((err) => {
                    return res.status(500).json({ "error": err.message });
                })
            }
            return res.status(200).json(formateDatatoSend(user));
        })
        .catch((err) => {
            return res.status(500).json({ "error": "Faild to authenticate you with google. Try with some other google account" })
        })

})



app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ "personal_info.email": email });
  if (!user) return res.status(404).json({ error: "User not found" });
  const otp = Math.floor(100000 + Math.random() * 900000);
  user.reset_password_otp = otp;
  user.reset_password_otp_expires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
  await user.save();

  // Send OTP via email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const mailOptions = {
    to: user.personal_info.email, 
    from: process.env.EMAIL,
    subject: "Password Reset OTP",
    text: `Your password reset OTP is: ${otp}. It is valid for 10 minutes.`,
  };

  await transporter.sendMail(mailOptions);
  res.status(200).json({ message: "OTP sent to your email" });
});


app.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Validate input
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Find user by email
    const user = await User.findOne({ "personal_info.email": email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    

    // Check if OTP is expired FIRST
    if (Date.now() > user.reset_password_otp_expires) {
      // Clear expired OTP
      user.reset_password_otp = undefined;
      user.reset_password_otp_expires = undefined;
      await user.save();
      return res.status(400).json({ error: "OTP expired. Please request a new one." });
    }

    // Convert both to strings for comparison to avoid type issues
    const userOtp = String(user.reset_password_otp);
    const inputOtp = String(otp).trim(); // Remove any whitespace

    console.log("Stored OTP:", userOtp);
    console.log("Input OTP:", inputOtp);
    console.log("OTP Match:", userOtp === inputOtp);

    if (userOtp !== inputOtp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Validate password strength (optional)
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    // Update password and clear OTP fields
    user.personal_info.password = await bcrypt.hash(newPassword, 10);
    user.reset_password_otp = undefined;
    user.reset_password_otp_expires = undefined;
    await user.save();

    res.status(200).json({ message: "Password has been reset successfully" });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



app.post('/change-password', verifyJWT, (req, res) => {
    let { CurrentPassword, NewPassword } = req.body;

    if (!passwordRegex.test(CurrentPassword) || !passwordRegex.test(NewPassword)) {
        return res.status(403).json({ error: "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters" })
    }

    User.findOne({ _id: req.user })
        .then((user) => {
            if (user.google_auth) {
                return res.status(403).json({ error: "You can't change account's password bacause you logged in through google" })
            }
            bcrypt.compare(CurrentPassword, user.personal_info.password, (err, result) => {
                if (err) {
                    return res.status(500).json({ error: "Some error occured while changing the password, please try again later" })
                }
                if (!result) {
                    return res.status(403).json({ error: "Incorrect current password" })
                }

                bcrypt.hash(NewPassword, 10, (err, hashed_password) => {
                    User.findOneAndUpdate({ _id: req.user }, { "personal_info.password": hashed_password })
                        .then((u) => {
                            return res.status(200).json({ status: "password changed" })
                        })
                        .catch(err => {
                            return res.status(500).json({ error: "Some error occured while saving new password, please try again later" })
                        })
                })
            })

        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: "User not found" })
        })

})


app.post('/upload-blog-image', upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ filename: req.file.filename });
});



app.post("/update-profile-img", verifyJWT, async (req, res) => {
    try {
        let { imageData } = req.body;
        let userId = req.user;

        // Validate if imageData exists
        if (!imageData) {
            return res.status(400).json({ error: "No image data provided" });
        }

        // Validate base64 format
        if (!imageData.startsWith('data:image/')) {
            return res.status(400).json({ error: "Invalid image format" });
        }

        // Optional: Validate image size (base64 is ~33% larger than original)
        const sizeInBytes = (imageData.length * 3) / 4;
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        if (sizeInBytes > maxSize) {
            return res.status(400).json({ error: "Image size too large. Maximum 5MB allowed." });
        }

        // Update user profile image in database
        const updatedUser = await User.findOneAndUpdate(
            { _id: userId }, 
            { "personal_info.profile_img": imageData },
            { new: true } // Return updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json({
            profile_img: imageData,
            message: "Profile image updated successfully"
        });

    } catch (err) {
        console.error("Profile image update error:", err);
        return res.status(500).json({ 
            error: "Internal server error while updating profile image" 
        });
    }
});


app.post('/update-profile', verifyJWT, (req,res)=>{
    let { username, bio, social_links } = req.body;

    let bioLimit = 150;

    if(username.length < 3){
        return res.status(403).json({error: "Username should be at least 3 letters long"})
    }
    if(bio.length > bioLimit){
        return res.status(403).json({error: `Bio should not be more than ${bioLimit} characters`})
    }
    let socialLinksArr = Object.keys(social_links);

    try{
        for(let i = 0; i<socialLinksArr.length; i++){
            if(social_links[socialLinksArr[i]].length){
                let hostname = new URL(social_links[socialLinksArr[i]]).hostname;

                if(!hostname.includes(`${socialLinksArr[i]}.com`) && socialLinksArr[i] != 'website'){
                    return res.status(403).json({error: `${socialLinksArr[i]} link is invalid. You must enter a full link`})
                }
            }
        }
    }catch(err){
        return res.status(500).json({error: "You must provide full social links withhttp(s) included"})
    }

    let updateObj = {
        "personal_info.username": username,
        "personal_info.bio": bio,
        social_links
    }

    User.findOneAndUpdate({_id: req.user}, updateObj, {
        runValidators: true
    })
    .then(() =>{
        return res.status(200).json({username})
    })
    .catch(err =>{
        if(err.code == 11000){
            return res.status(403).json({error: "username is already taken"})
        }
        return res.status(500).json({error: err.message})
    })
})


app.post('/latest-blogs', (req, res) => {

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
})


app.post('/all-latest-blogs-count', (req, res) => {
    Blog.countDocuments({ draft: false })
        .then(count => {
            return res.status(200).json({ totalDocs: count })
        })
        .catch(err => {
            console.log(err.message);
            return res.status(500).json({ error: err.message })
        })
})


app.get('/trending-blogs', (req, res) => {
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
})


app.post('/search-blogs', (req, res) => {
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
})


app.post('/search-blogs-count', (req, res) => {

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

})


app.post('/search-users', (req, res) => {
    let { query } = req.body;

    User.find({ "personal_info.username": new RegExp(query, 'i') })
        .limit(50)
        .select("personal_info.fullname personal_info.username personal_info.profile_img -_id")
        .then(users => {
            return res.status(200).json({ users })
        })
        .catch(err => {
            return res.status(500).json({ error: err.message })
        })
})


app.post('/get-profile', (req, res) => {

    let { username } = req.body;

    User.findOne({ "personal_info.username": username })
        .select("-personal_info.password -confirmPassword -google_auth -updatedAt -blogs")
        .then(user => {
            return res.status(200).json(user)
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({ error: err.message });
        })


})


app.post('/create-blog', verifyJWT, (req, res) => {

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
})




app.post('/get-blog', (req, res) => {
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
})


app.post('/like-blog', verifyJWT, (req, res) => {
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
})

app.post('/isliked-by-user', verifyJWT, (req, res) => {
    let user_id = req.user;

    let { _id } = req.body;

    Notification.exists({ user: user_id, type: 'like', blog: _id })
        .then(result => {
            return res.status(200).json({ result })
        })
        .catch(err => {
            return res.status(500).json({ error: err.message })
        })
})



app.post('/add-comment', verifyJWT, async (req, res) => {
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
});



app.post('/get-blog-comments', (req, res) => {
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
})


app.post('/get-replies', (req, res) => {
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
})


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
}

app.post('/delete-comment', verifyJWT, (req, res) => {
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
})

app.get('/new-notification', verifyJWT, (req,res) =>{
    let user_id = req.user;

    Notification.exists({ notification_for: user_id, seen: false, user: { $ne: user_id } })
    .then(result =>{
        if(result){
            return res.status(200).json({new_notification_available: true})
        }else{
            return res.status(200).json({new_notification_available: false})
        }
    })
    .catch(err =>{
        console.log(err.message)
        return res.status(500).json({error: err.message})
    })
})


app.post('/notifications', verifyJWT, (req,res)=>{
    let user_id = req.user;

    let { page, filter, deletedDocCount } = req.body;

    let maxLimit = 10;

    let findQuery = { notification_for: user_id, user: {$ne: user_id} };

    let skipDocs = (page - 1) * maxLimit;

    if(filter != 'all'){
        findQuery.type = filter;
    }
    if(deletedDocCount){
        skipDocs -= deletedDocCount;
    }

    Notification.find(findQuery)
    .skip(skipDocs)
    .limit(maxLimit)
    .populate("blog", "title blog_id")
    .populate("user", "personal_info.fullname personal_info.username personal_info.profile_img")
    .populate("comment", "comment")
    .populate("replied_on_comment", "comment")
    .populate("reply", "comment")
    .sort({ createdAt: -1 })
    .select("createdAt type seen reply")
    .then(notifications =>{

        Notification.updateMany(findQuery, {seen: true})
        .skip(skipDocs)
        .limit(maxLimit)
        .then(() => console.log('notification seen'))

        return res.status(200).json({notifications})
    })
    .catch(err =>{
        console.log(err.message)
        return res.status(500).json({error: err.message})
    })
})

app.post('/all-notification-count', verifyJWT, (req,res) =>{
     let user_id = req.user;

     let { filter } = req.body;

     let findQuery = { notification_for: user_id, user: {$ne: user_id} }

     if(filter != 'all'){
        findQuery.type = filter;
     }

     Notification.countDocuments(findQuery)
     .then(count =>{
        return res.status(200).json({totalDocs: count})
    })
    .catch(err =>{
        return res.status(500).json({error: err.message})
    })
})


app.post('/user-written-blogs', verifyJWT, (req,res) =>{
        let user_id = req.user;

        let { page, draft, query, deletedDocCount } = req.body;

        let maxLimit = 5;
        let skipDocs = (page - 1) * maxLimit;

        if(deletedDocCount){
            skipDocs -= deletedDocCount;
        }

        Blog.find({author: user_id, draft, title: new RegExp(query, 'i') })
        .skip(skipDocs)
        .limit(maxLimit)
        .sort({publishedAt: -1})
        .select('title banner publishedAt blog_id activity des draft -_id')
        .then(blogs =>{
            return res.status(200).json({blogs})
        })
        .catch(err =>{
            return res.status(500).json({error: err.message})
        })
})


app.post('/user-written-blogs-count', verifyJWT, (req,res) =>{
    let user_id = req.user;

    let { draft, query } = req.body;

    Blog.countDocuments({author: user_id, draft, title: new RegExp(query, 'i')})
    .then(count =>{
        return res.status(200).json({totalDocs: count})
    })
    .catch(err =>{
        console.log(err.message);
        return res.status(500).json({error: err.message})
    })
})


app.post('/delete-blog', verifyJWT, (req,res) =>{
    let user_id = req.user;
    let { blog_id } = req.body;

    Blog.findOneAndDelete({ blog_id })
    .then(blog =>{

        Notification.deleteMany({ blog: blog._id })
        .then(data => console.log('notification deleted'))

        Comment.deleteMany({blog_id: blog._id}).then(data => console.log('commments deleted'))

        User.findOneAndUpdate({ _id: user_id }, { $pull: {blog: blog._id}, $inc: {"account_info.total_posts": -1} })
        .then(user =>console.log('Blog deleted'))

        return res.status(200).json({status: 'done'})
    })
    .catch(err =>{
        return res.status(500).json({error: err.message})
    })
})



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})