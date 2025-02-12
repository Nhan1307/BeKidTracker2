const { log, error } = require("console");
const UserModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");

require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
        user: process.env.USERNAME_EMAIL,
        pass: process.env.PASSWORD_EMAIL,
    },
});


const getJWT = (email, id) => {
    const payload = {
        email,
        id
    };
    const token = jwt.sign(payload, process.env.SECRET_KEY, {
        expiresIn: '7d' // Token hết hạn sau 7 ngày
    });
    return token;
}

const handleSendEmail = async (val) => {


    try {
        const info = await transporter.sendMail(val);

        console.log("Message sent: %s", info.messageId);
        return "send email successfully!";

    } catch (error) {
        console.log(`can not send email ${error}`);
        return error;
    }
};

const verification = asyncHandler(async (req, res) => {
    const { email } = req.body || {};

    console.log(email);

    if (!email) {
        res.status(400).json({ message: "Email is required" });
        return;
    }

    const verificationCode = Math.round(1000 + Math.random() * 9000);

    const data = {
        from: `"Child Schedule Management App 👻" <${process.env.USERNAME_EMAIL}>`,
        to: email,
        subject: "Verification email code",
        text: "your code to verification email",
        html: `<h1>${verificationCode}</h1>`,
    };

    try {
        await handleSendEmail(data);
        res.status(200).json({
            message: "Send email successfully!",
            data: {
                code: verificationCode,
                email: email
            },
            status: 200
        });
    } catch (error) {
        console.log(error);
        res.status(401).json({ message: "Can not send email" });
    }



});

const register = asyncHandler(async (req, res) => {
    const { email, fullname, password,photoURL } = req.body;

    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
        res.status(400).json({ message: "User already exists" });
        throw new Error("User already exists")

    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new UserModel({ email, fullname, password: hashedPassword ,photoURL});
    await newUser.save();
    res.status(200).json({
        message: "User created!",
        data: {
            id: newUser.id,
            email: newUser.email,
            fullname: newUser.fullname,
            accesstoken: await getJWT(email, newUser.id),
            photoURL: newUser.photoURL
        }

    });

    console.log(newUser);
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    log(email, password);
    const existUser = await UserModel.findOne({ email });

    if (!existUser) {
        res.status(400).json({ message: "User not found" });
        throw new Error("User not found");
    }

    const isMatch = await bcrypt.compare(password, existUser.password);

    if (!isMatch) {
        res.status(401).json({ message: "Password is incorrect" });
        throw new Error("Password is incorrect");
    }

    console.log(`${email} logged in successfully!`);
    

    res.status(200).json({
        message: "Login success",
        data: {
            id: existUser.id,
            email: existUser.email,
            fullname: existUser.fullname,
            accesstoken: await getJWT(email, existUser.id),
        }
    });
});

const changePassword = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const data = {
        from: `"Đặt lại mật khẩu 🖐🏿" <${process.env.USERNAME_EMAIL}>`,
        to: email,
        subject: "Thay đổi mật khẩu",
        text: "mật khảu mới của bạn ",
        html: `<h1>${password}</h1>`,
    };

    const user = await UserModel.findOne({ email });
    if (!user) {
        res.status(400).json({ message: "User not found" });
        throw new Error("User not found");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await UserModel.findByIdAndUpdate(user._id, {
        password: hashedPassword,
        isChangePassword: true,
    }).then(() => {
        console.log("update password successfully!");
    }).catch((error) => {
        console.log("error update password");
    })

    await handleSendEmail(data).then(() => {
        res.status(200).json({
            message: "Change Pasword successfully!",
            data: [],
            status: 200
        });

    }).catch((error) => {
        console.log(error);
        res.status(401).json({ message: "Can not send email" });
    });
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const randPassword = (Math.random() * 900000 + 100000).toFixed(0); // Ensure password is a string

    const data = {
        from: `"Đặt lại mật khẩu 🖐🏿" <${process.env.USERNAME_EMAIL}>`,
        to: email,
        subject: "Quên mật khẩu",
        text: "mật khảu mới của bạn ",
        html: `<h1>${randPassword}</h1>`,
    };

    const user = await UserModel.findOne({ email });
    if (!user) {
        res.status(400).json({ message: "User not found" });
        throw new Error("User not found");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(randPassword, salt);

    await UserModel.findByIdAndUpdate(user._id, {
        password: hashedPassword,
        isChangePassword: true,
    }).then(() => {
        console.log("update password successfully!");
    }).catch((error) => {
        console.log("error update password");
    })

    await handleSendEmail(data).then(() => {
        res.status(200).json({
            message: "Send email successfully!",
            data: [],
            status: 200
        });

    }).catch((error) => {
        console.log(error);
        res.status(401).json({ message: "Can not send email" });
    });
})



const handleLoginWithGoogle = asyncHandler(async (req, res) => {
    const userInfo = req.body;
    console.log("user info", userInfo);
    

    const existingUser = await UserModel.findOne({ email: userInfo.email });

    let user = userInfo;

    if (existingUser) {
        await UserModel.findByIdAndUpdate(existingUser._id, userInfo);

        user.accesstoken = await getJWT(userInfo.email, userInfo.id);
    } else {
        const newUser = new UserModel({
            email: userInfo.email,
            fullname: userInfo.fullname,
            photoURL: userInfo.photo,
            ...userInfo,
        });


        
        
        await newUser.save();

        user.accesstoken = await getJWT(userInfo.email, newUser._id);
    }

    res.status(200).json({
        message: "Login with google successfully!",
        data: user,
        status: 200
    });
});


module.exports = {
    register,
    login,
    verification,
    forgotPassword,
    handleLoginWithGoogle,
    changePassword
}