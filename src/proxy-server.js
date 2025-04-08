// proxy-server.js
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = 3001;

app.get("/comicvine", async (req, res) => {
  const { query } = req.query;
  const apiKey = process.env.VITE_COMICVINE_API_KEY;

  try {
    const response = await fetch(
      `https://comicvine.gamespot.com/api/search/?api_key=${apiKey}&format=json&query=${encodeURIComponent(query)}&resources=issue`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch from ComicVine" });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
});
