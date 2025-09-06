import bcrypt from 'bcrypt';
import { getAuth } from 'firebase-admin/auth';
import nodemailer from 'nodemailer';
import User from '../Schema/User.js';
import { emailRegex, passwordRegex, formateDatatoSend, generateUsername } from '../utils/helpers.js';

export const signup = (req, res) => {
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
};

export const signin = (req, res) => {
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
};

export const googleAuth = async (req, res) => {
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
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ "personal_info.email": email });
        if (!user) return res.status(404).json({ error: "User not found" });
        const otp = Math.floor(100000 + Math.random() * 900000);
        user.reset_password_otp = otp;
        user.reset_password_otp_expires = Date.now() + 10 * 60 * 1000;
        await user.save();

        // Send OTP via email
        const transporter = nodemailer.createTransporter({
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
    } catch (err) {
        console.error("Forgot password error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const resetPassword = async (req, res) => {
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
};

export const changePassword = (req, res) => {
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
};