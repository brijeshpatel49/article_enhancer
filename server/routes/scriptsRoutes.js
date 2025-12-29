import express from "express";
import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scriptsDir = path.join(__dirname, "../scripts");

const runScript = (scriptName, res) => {
  const scriptPath = path.join(scriptsDir, scriptName);
  console.log(`Executing script: ${scriptPath}`);

  exec(`node "${scriptPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing script: ${error}`);
      return res.status(500).json({ error: error.message, details: stderr });
    }
    console.log(`Script output: ${stdout}`);
    res.json({ message: "Script executed successfully", output: stdout });
  });
};

router.post("/scrape", (req, res) => {
  runScript("scrapeArticle.js", res);
});

router.post("/enhance", (req, res) => {
  runScript("updateArticles.js", res);
});

export default router;
