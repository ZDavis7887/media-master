import React, { useState, useEffect } from "react";

export default function RandomPicker() {
  const [media, setMedia] = useState({
    movies: [],
    games: [],
    books: [],
    comics: [],
    graphicNovels: [],
    shows: [],
    documentaries: [],
    anime: [],
    manga: []
  });
  const [picked, setPicked] = useState(null);

  const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const COMICVINE_API_KEY = import.meta.env.VITE_COMICVINE_API_KEY;

  useEffect(() => {
    Promise.all([
      fetch("/data/cleaned_movies.json").then((res) => res.json()),
      fetch("/data/games.json").then((res) => res.json()),
      fetch("/data/cleaned_books.json").then((res) => res.json()),
      fetch("/data/comics.json").then((res) => res.json()),
      fetch("/data/graphic_novels.json").then((res) => res.json()),
      fetch("/data/shows.json").then((res) => res.json()),
      fetch("/data/documentaries.json").then((res) => res.json()),
      fetch("/data/Anime Cleaned.json").then((res) => res.json()),
      fetch("/data/manga.json").then((res) => res.json())
    ])
      .then(([movies, games, books, comics, graphicNovels, shows, documentaries, anime, manga]) => {
        setMedia({ movies, games, books, comics, graphicNovels, shows, documentaries, anime, manga });
      })
      .catch((err) => console.error("Failed to load media data:", err));
  }, []);

  const cleanTitle = (title) => {
    return title.replace(/\s*\([^)]*\)/g, "").replace(/\d+/g, "").trim();
  };

  const stripHtml = (html) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
  };

  const pickRandom = async (type) => {
    const entries = media[type]?.filter((m) =>
      typeof m.Watched === "string" ? m.Watched.toLowerCase() !== "yes" : true
    ) || [];

    const choice = entries[Math.floor(Math.random() * entries.length)];

    const isTMDBCategory = ["movies", "documentaries", "shows"].includes(type);
    if (isTMDBCategory && choice?.Title) {
      const cleanedTitle = cleanTitle(choice.Title);
      try {
        const searchRes = await fetch(
          `https://api.themoviedb.org/3/search/${type === "shows" ? "tv" : "movie"}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(cleanedTitle)}`
        );
        const searchData = await searchRes.json();

        if (searchData.results?.length) {
          const details = searchData.results[0];
          choice.Description = details.overview;
          choice.Poster = `https://image.tmdb.org/t/p/w500${details.poster_path}`;
          choice.Year = (details.first_air_date || details.release_date)?.slice(0, 4);
        }
      } catch (err) {
        console.error("TMDB fetch failed:", err);
      }
    }

    if (type === "games" && choice?.Title) {
      const cleanedTitle = cleanTitle(choice.Title);
      try {
        const response = await fetch(`http://localhost:3001/igdb?query=${encodeURIComponent(cleanedTitle)}`);
        const data = await response.json();

        if (data.length) {
          const game = data[0];
          choice.Description = game.summary || "No description available.";
          choice.Poster = game.cover?.url?.replace("t_thumb", "t_cover_big");
          choice.Year = game.first_release_date ? new Date(game.first_release_date * 1000).getFullYear() : null;
          choice.Genres = game.genres?.map((g) => g.name).join(", ");
        }
      } catch (err) {
        console.error("IGDB fetch failed:", err);
      }
    }

    if ((type === "comics" || type === "graphicNovels") && choice?.Title) {
      const cleanedTitle = cleanTitle(choice.Title);
      try {
        const response = await fetch(`http://localhost:3001/comicvine?query=${encodeURIComponent(cleanedTitle)}`);
        const data = await response.json();

        if (data.results?.length) {
          const comic = data.results[0];
          choice.Description = comic.deck || comic.description || "No description found.";
          choice.Poster = comic.image?.super_url;
          choice.Year = comic.cover_date?.slice(0, 4);
          choice.Publisher = comic.publisher?.name;
          choice.Characters = comic.character_credits?.slice(0, 5).map((char) => char.name).join(", ");
        }
      } catch (err) {
        console.error("ComicVine fetch failed:", err);
      }
    }

    if (type === "books" && choice?.Title) {
      const cleanedTitle = cleanTitle(choice.Title);
      try {
        const response = await fetch(`http://localhost:3001/googlebooks?query=${encodeURIComponent(cleanedTitle)}`);
        const data = await response.json();
        const book = data.items?.[0]?.volumeInfo;

        if (book) {
          choice.Description = book.description || "No description found.";
          choice.Poster = book.imageLinks?.thumbnail;
          choice.Year = book.publishedDate?.slice(0, 4);
          choice.Publisher = book.publisher;
        }
      } catch (err) {
        console.error("Google Books fetch failed:", err);
      }
    }

    if (type === "anime" && choice?.Title) {
      const cleanedTitle = cleanTitle(choice.Title);
      try {
        const response = await fetch(`http://localhost:3001/anilist-anime?query=${encodeURIComponent(cleanedTitle)}`);
        const data = await response.json();
        const anime = data.data?.Media;

        if (anime) {
          choice.Description = anime.description ? stripHtml(anime.description) : "No description available.";
          choice.Poster = anime.coverImage?.large;
          choice.Year = anime.startDate?.year;
        }
      } catch (err) {
        console.error("AniList Anime fetch failed:", err);
      }
    }

    if (type === "manga" && choice?.Title) {
      const cleanedTitle = cleanTitle(choice.Title);
      try {
        const response = await fetch(`http://localhost:3001/anilist-manga?query=${encodeURIComponent(cleanedTitle)}`);
        const data = await response.json();
        const manga = data.data?.Media;

        if (manga) {
          choice.Description = manga.description ? stripHtml(manga.description) : "No description available.";
          choice.Poster = manga.coverImage?.large;
          choice.Year = manga.startDate?.year;
        }
      } catch (err) {
        console.error("AniList Manga fetch failed:", err);
      }
    }

    setPicked({ ...choice, type });
  };

  return (
    <div className="min-h-screen bg-[#9cb76c] text-white font-press-start flex flex-col items-center justify-start p-6">
      <div className="mb-6 flex flex-wrap gap-4 justify-center w-full max-w-xl">
        {Object.keys(media).map((category) => (
          <button
            key={category}
            onClick={() => pickRandom(category)}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-lg py-4 px-8 capitalize text-sm border-4 border-black shadow-lg"
          >
            {category.replace(/([A-Z])/g, " $1").trim()}
          </button>
        ))}
      </div>

      <div className="bg-gray-800 border-4 border-blue-400 rounded-2xl p-6 shadow-inner w-[90%] max-w-3xl">
        <h1 className="text-3xl font-bold mb-4 text-orange-300 text-center">📺 Media Boy</h1>
        {picked && (
          <div className="bg-gray-700 border border-blue-300 rounded-xl p-6 text-center">
            <h2 className="text-3xl font-bold text-orange-200 mb-2">{picked.Title}</h2>
            {picked.Year && <p className="text-blue-300 text-lg">({picked.Year})</p>}
            {picked.Description && <p className="mt-3 text-sm text-gray-300 leading-relaxed">{picked.Description}</p>}
            {picked.Poster && (
              <img
                src={picked.Poster}
                alt={picked.Title}
                className="mt-5 rounded-lg max-h-64 mx-auto border border-blue-300"
              />
            )}
            {picked.Publisher && <p className="text-sm mt-3 text-purple-300">Publisher: {picked.Publisher}</p>}
            {picked.Characters && <p className="text-sm mt-1 text-teal-300">Characters: {picked.Characters}</p>}
            {picked.Genres && <p className="text-sm mt-1 text-green-300">Genres: {picked.Genres}</p>}
            <p className="text-xs mt-3 text-gray-400 italic">🎲 Category: {picked.type}</p>
          </div>
        )}
      </div>
    </div>
  );
}
