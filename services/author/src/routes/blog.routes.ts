import express from "express";
import { isAuth } from "../middleware/isAuth.middleware.js";
import uploadFile from "../middleware/multer.middleware.js";
import {
  aiBlogResponse,
  aiDescriptionResponse,
  aiTitleResponse,
  createBlog,
  deleteBlog,
  updateBlog,
} from "../controllers/blog.controller.js";

const router = express();

router.post("/blog/new", isAuth, uploadFile, createBlog);
router.post("/blog/:id", isAuth, uploadFile, updateBlog);
router.delete("/blog/:id", isAuth, deleteBlog);
router.post("/ai/title", aiTitleResponse);
router.post("/ai/description", aiDescriptionResponse);
router.post("/ai/blog", aiBlogResponse);

export default router;
