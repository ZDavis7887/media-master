import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ComicVine Proxy
app.get("/comicvine", async (req, res) => {
  const query = req.query.query;
  const apiKey = process.env.VITE_COMICVINE_API_KEY;

  try {
    const response = await fetch(
      `https://comicvine.gamespot.com/api/search/?api_key=${apiKey}&format=json&resources=issue&query=${encodeURIComponent(query)}`
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("ComicVine fetch failed:", err);
    res.status(500).json({ error: "ComicVine fetch failed" });
  }
});

// IGDB Proxy
app.get("/igdb", async (req, res) => {
  const query = req.query.query;
  const clientId = process.env.TWITCH_CLIENT_ID;
  const accessToken = process.env.TWITCH_ACCESS_TOKEN;

  try {
    const response = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": clientId,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "text/plain"
      },
      body: `search "${query}"; fields name,summary,cover.url,first_release_date,genres.name; limit 1;`
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("IGDB fetch failed:", err);
    res.status(500).json({ error: "IGDB fetch failed" });
  }
});

// Google Books Proxy
app.get("/googlebooks", async (req, res) => {
  const query = req.query.query;
  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Google Books fetch failed:", err);
    res.status(500).json({ error: "Google Books fetch failed" });
  }
});

// AniList Anime
app.get("/anilist-anime", async (req, res) => {
  const query = req.query.query;
  try {
    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query ($search: String) {
            Media(search: $search, type: ANIME) {
              title { romaji }
              description
              coverImage { large }
              startDate { year }
            }
          }
        `,
        variables: { search: query }
      })
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("AniList Anime fetch failed:", err);
    res.status(500).json({ error: "AniList Anime fetch failed" });
  }
});

// AniList Manga Proxy
app.get("/anilist-manga", async (req, res) => {
  const query = req.query.query;

  const graphqlQuery = {
    query: `
      query ($search: String) {
        Media(search: $search, type: MANGA) {
          id
          title {
            romaji
            english
            native
          }
          coverImage {
            large
          }
          description
          startDate {
            year
          }
        }
      }
    `,
    variables: { search: query }
  };

  try {
    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(graphqlQuery)
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("AniList Manga fetch failed:", err);
    res.status(500).json({ error: "AniList Manga fetch failed" });
  }
});


app.listen(PORT, () => {
  console.log(`🔌 Proxy server running on http://localhost:${PORT}`);
});
