import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import User from '../Schema/User.js';

// Regex patterns
export const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
export const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

// Format user data for response
export const formateDatatoSend = (user) => {
    const access_token = jwt.sign({ id: user._id }, process.env.SECRET_ACCESS_KEY);

    return {
        access_token,
        profile_img: user.personal_info.profile_img,
        username: user.personal_info.username,
        fullname: user.personal_info.fullname
    }
};

// Generate unique username
export const generateUsername = async (email) => {
    let username = email.split("@")[0];

    let isUsernameExists = await User.exists({ "personal_info.username": username }).then((result) => result);

    isUsernameExists ? username += nanoid().substring(0, 5) : "";

    return username;
};