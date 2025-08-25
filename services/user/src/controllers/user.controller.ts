import User from "../model/user.model.js";
import jwt from "jsonwebtoken";
import TryCatch from "../utils/TryCatch.js";

export const loginUser = TryCatch(async (req, res) => {
  const { email, name, image } = req.body;

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({ email, name, image });
  }

  const token = jwt.sign({ user }, process.env.JWT_SEC as string, {
    expiresIn: "5d",
  });

  res.status(200).json({ message: "Login Successful", token, user });
});

export const myProfile = TryCatch(async (req, res) => {

});


// continue video at 1:02:01 https://www.youtube.com/watch?v=3nu6Y5-h-hU&t=21s