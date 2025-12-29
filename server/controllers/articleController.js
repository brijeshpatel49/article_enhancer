import Article from "../models/article.js";

const getAllArticles = async (req, res) => {
  try {
    const items = await Article.find().sort({ createdAt: 1 });
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

const getArticleById = async (req, res) => {
   try {
    const item = await Article.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Not found" });
    }
    res.json(item);
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

const createArticles = async (req, res) => {
  try {
    const item = new Article(req.body);
    const saved = await item.save();
    res.status(201).json(saved);
  } catch (e) {
    res.status(400).json({ message: "Bad request" });
  }
};

const updateArticle = async (req, res) => {
  try {
    const updated = await Article.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Not found" });
    }
    res.json(updated);
  } catch (e) {
    res.status(400).json({ message: "Bad request" });
  }
};

const deleteArticle = async (req, res) => {
  try {
    const deleted = await Article.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Not found" });
    }
    res.json({ message: "Deleted" });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

export { getAllArticles, getArticleById, createArticles, updateArticle, deleteArticle }; 