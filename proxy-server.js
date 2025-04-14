import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());

let twitchAccessToken = process.env.TWITCH_ACCESS_TOKEN;
const twitchClientId = process.env.TWITCH_CLIENT_ID;
const twitchClientSecret = process.env.TWITCH_CLIENT_SECRET;

async function refreshTwitchToken() {
  try {
    const res = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${twitchClientId}&client_secret=${twitchClientSecret}&grant_type=client_credentials`, {
      method: "POST"
    });
    const data = await res.json();
    if (data.access_token) {
      twitchAccessToken = data.access_token;
      console.log("🔄 Twitch token refreshed");
    } else {
      console.error("❌ Failed to refresh Twitch token:", data);
    }
  } catch (err) {
    console.error("❌ Twitch token refresh error:", err);
  }
}

// Refresh the token every 24 hours
setInterval(refreshTwitchToken, 24 * 60 * 60 * 1000);
refreshTwitchToken();

app.get("/comicvine", async (req, res) => {
  const { query } = req.query;
  const apiKey = process.env.VITE_COMICVINE_API_KEY;
  const url = `https://comicvine.gamespot.com/api/search/?api_key=${apiKey}&format=json&resources=volume&query=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "MediaBoyApp"
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("ComicVine fetch failed:", err);
    res.status(500).json({ error: "ComicVine fetch failed" });
  }
});

app.get("/igdb", async (req, res) => {
  const { query } = req.query;
  const url = "https://api.igdb.com/v4/games";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Client-ID": twitchClientId,
        "Authorization": `Bearer ${twitchAccessToken}`,
        "Content-Type": "text/plain"
      },
      body: `search "${query}"; fields name,genres.name,cover.url,summary,first_release_date; limit 1;`
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("IGDB fetch failed:", err);
    res.status(500).json({ error: "IGDB fetch failed" });
  }
});

// 📚 Google Books API Proxy
app.get("/googlebooks", async (req, res) => {
  const query = req.query.query;

  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`
    );
    
    // Check if response is OK before parsing
    if (!response.ok) {
      throw new Error(`Google Books API returned ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Google Books fetch failed:", err);
    res.status(500).json({ error: "Google Books fetch failed" });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
});
