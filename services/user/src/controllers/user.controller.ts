import User from "../model/user.model.js";
import jwt from "jsonwebtoken";
import TryCatch from "../utils/TryCatch.js";
import type { AuthenticatedRequest } from "../middleware/isAuth.middleware.js";
import getBuffer from "../utils/dataUri.js";
import { v2 as cloudinary } from "cloudinary";
import { oAuth2Client } from "../utils/GoogleConfig.js";
import axios from "axios";

// export const loginUser = TryCatch(async (req, res) => {
//   try {

//   const {code} = req.body;

//   if(!code){
//     res.status(400).json({ message: "Authorization Code Required" });
//     return;
//   }

//   const googleRes = await oAuth2Client.getToken(code);

//   oAuth2Client.setCredentials(googleRes.tokens);

//   const userRes = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`);

//   const { email, name, picture } = userRes.data;

//   let user = await User.findOne({ email });

//   if (!user) {
//     user = await User.create({ email, name, image: picture });
//   }

//   const token = jwt.sign({ user }, process.env.JWT_SEC as string, {
//     expiresIn: "5d",
//   });

//   res.status(200).json({ message: "Login Successful", token, user });
//   } catch (error) {
//     res.status(500).json({ message: "Internal Server Error", error: error});
//   }
// });

export const loginUser = TryCatch(async (req, res) => {
  // console.log("POST /api/v1/login received, body:", req.body);

  const { code } = req.body;

  if (!code) {
    console.log("No code provided");
    res.status(400).json({ message: "Authorization code is required" });
    return;
  }

  try {
    // console.log("Exchanging code with Google...");
    const googleRes = await oAuth2Client.getToken(code);
    // console.log("Token received from Google");

    oAuth2Client.setCredentials(googleRes.tokens);

    const userRes = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
    );

    // console.log("User info from Google:", userRes.data.email);

    const { email, name, picture } = userRes.data;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ name, email, image: picture });
      console.log("New user created:", email);
    }

    const token = jwt.sign({ user }, process.env.JWT_SEC as string, {
      expiresIn: "5d",
    });

    res.status(200).json({
      message: "Login success",
      token,
      user,
    });
  } catch (error: any) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

export const myProfile = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;

  res.json(user);
});

export const getUserProfile = TryCatch(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404).json({ message: "No User with This Id" });
    return;
  }

  res.json(user);
});

export const updateUser = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { name, instagram, facebook, linkedin, bio } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      name,
      instagram,
      facebook,
      linkedin,
      bio,
    },
    { new: true }
  );

  const token = jwt.sign({ user }, process.env.JWT_SEC as string, {
    expiresIn: "5d",
  });
  res.json({ message: "User Updated", token, user });
});

export const updateProfilePic = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const file = req.file;

    if (!file) {
      res.status(400).json({ message: "No File To Uploaded" });
      return;
    }

    const fileBuffer = getBuffer(file);

    if (!fileBuffer || !fileBuffer.content) {
      res.status(400).json({ message: "Failed To Generate Buffer" });
      return;
    }

    const cloud = await cloudinary.uploader.upload(fileBuffer.content, {
      folder: "blogs",
    });

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        image: cloud.secure_url,
      },
      { new: true }
    );

    const token = jwt.sign({ user }, process.env.JWT_SEC as string, {
      expiresIn: "5d",
    });
    res.json({ message: "User Profile Pic Updated", token, user });
  }
);
