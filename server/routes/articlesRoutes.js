import express from "express";
import {
  getAllArticles,
  getArticleById,
  createArticles,
  updateArticle,
  deleteArticle,
} from "../controllers/articleController.js";

const router = express.Router();

router.get("/", getAllArticles);

router.get("/:id", getArticleById);

router.post("/", createArticles);

router.put("/:id", updateArticle);

router.delete("/:id", deleteArticle);

export default router;
