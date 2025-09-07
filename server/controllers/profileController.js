import User from '../Schema/User.js';

export const getProfile = (req, res) => {
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
};

export const updateProfileImg = async (req, res) => {
    try {
        let { imageData } = req.body;
        let userId = req.user;

        
        if (!imageData) {
            return res.status(400).json({ error: "No image data provided" });
        }

        
        if (!imageData.startsWith('data:image/')) {
            return res.status(400).json({ error: "Invalid image format" });
        }

        
        const sizeInBytes = (imageData.length * 3) / 4;
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        if (sizeInBytes > maxSize) {
            return res.status(400).json({ error: "Image size too large. Maximum 5MB allowed." });
        }

        
        const updatedUser = await User.findOneAndUpdate(
            { _id: userId }, 
            { "personal_info.profile_img": imageData },
            { new: true } 
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
};

export const updateProfile = (req, res) => {
    let { username, bio, social_links } = req.body;
    let bioLimit = 150;

    if (username.length < 3) {
        return res.status(403).json({ error: "Username should be at least 3 letters long" })
    }
    if (bio.length > bioLimit) {
        return res.status(403).json({ error: `Bio should not be more than ${bioLimit} characters` })
    }
    let socialLinksArr = Object.keys(social_links);

    try {
        for (let i = 0; i < socialLinksArr.length; i++) {
            if (social_links[socialLinksArr[i]].length) {
                let hostname = new URL(social_links[socialLinksArr[i]]).hostname;

                if (!hostname.includes(`${socialLinksArr[i]}.com`) && socialLinksArr[i] != 'website') {
                    return res.status(403).json({ error: `${socialLinksArr[i]} link is invalid. You must enter a full link` })
                }
            }
        }
    } catch (err) {
        return res.status(500).json({ error: "You must provide full social links with http(s) included" })
    }

    let updateObj = {
        "personal_info.username": username,
        "personal_info.bio": bio,
        social_links
    }

    User.findOneAndUpdate({ _id: req.user }, updateObj, {
        runValidators: true
    })
        .then(() => {
            return res.status(200).json({ username })
        })
        .catch(err => {
            if (err.code == 11000) {
                return res.status(403).json({ error: "username is already taken" })
            }
            return res.status(500).json({ error: err.message })
        })
};

export const searchUsers = (req, res) => {
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
};