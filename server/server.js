import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import articlesRouter from "./routes/articlesRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ ok: true });
});

import scriptsRouter from "./routes/scriptsRoutes.js";

app.use("/api/articles", articlesRouter);
app.use("/api/scripts", scriptsRouter);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log("Server started");
    });
  })
  .catch(() => {
    console.log("Database connection failed");
  });
