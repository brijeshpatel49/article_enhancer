import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
  {
    title: String,
    slug: String,
    content: String,
    sourceUrl: String,
    updated: { type: Boolean, default: false },
    isEnhanced: { type: Boolean, default: false },
    references: [String],
  },
  { timestamps: true }
);

const Article = mongoose.model("Article", articleSchema);

export default Article;
