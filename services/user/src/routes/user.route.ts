import express from "express";
import { getUserProfile, loginUser, myProfile, updateProfilePic, updateUser } from "../controllers/user.controller.js";
import { isAuth } from "../middleware/isAuth.middleware.js";
import uploadFile from "../middleware/multer.middleware.js";


const router = express.Router();

router.post("/login", loginUser);
router.get("/me", isAuth, myProfile);
router.get("/user/:id", getUserProfile);
router.post("/user/update", isAuth, updateUser);
router.post("/user/update/pic", isAuth, uploadFile, updateProfilePic);


export default router;