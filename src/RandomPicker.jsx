import React, { useState, useEffect } from "react";

export default function RandomPicker() {
  const [media, setMedia] = useState({
    movies: [],
    games: [],
    books: [],
    comics: [],
    graphicNovels: [],
    shows: [],
    documentaries: []
  });
  const [picked, setPicked] = useState(null);

  const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

  useEffect(() => {
    Promise.all([
      fetch("/data/cleaned_movies.json").then((res) => res.json()),
      fetch("/data/games.json").then((res) => res.json()),
      fetch("/data/cleaned_books.json").then((res) => res.json()),
      fetch("/data/comics.json").then((res) => res.json()),
      fetch("/data/graphic_novels.json").then((res) => res.json()),
      fetch("/data/shows.json").then((res) => res.json()),
      fetch("/data/documentaries.json").then((res) => res.json())
    ])
      .then(([movies, games, books, comics, graphicNovels, shows, documentaries]) => {
        setMedia({ movies, games, books, comics, graphicNovels, shows, documentaries });
      })
      .catch((err) => console.error("Failed to load media data:", err));
  }, []);

  const cleanTitle = (title) => {
    return title.replace(/\s*\([^)]*\)/g, "").replace(/\d+/g, "").trim();
  };

  const pickRandom = async (type) => {
    const entries = media[type]?.filter((m) =>
      typeof m.Watched === "string" ? m.Watched.toLowerCase() !== "yes" : true
    ) || [];

    const choice = entries[Math.floor(Math.random() * entries.length)];

    if (type === "movies" && choice?.Title) {
      const cleanedTitle = cleanTitle(choice.Title);
      try {
        const searchRes = await fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(cleanedTitle)}`
        );
        const searchData = await searchRes.json();

        if (searchData.results?.length) {
          const movieDetails = searchData.results[0];
          choice.Description = movieDetails.overview;
          choice.Poster = `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`;
          choice.Year = movieDetails.release_date?.slice(0, 4);
        }
      } catch (err) {
        console.error("TMDB fetch failed:", err);
      }
    }

    setPicked({ ...choice, type });
  };

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white font-press-start p-4 flex flex-col items-center">
      <div className="bg-orange-600 border-4 border-blue-500 rounded-2xl shadow-lg p-6 w-full max-w-xl relative">
        <h1 className="text-4xl font-bold mb-6 text-center text-orange-200 animate-pulse">📺 Media Boy</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {Object.keys(media).map((category) => (
            <button
              key={category}
              onClick={() => pickRandom(category)}
              className="bg-blue-600 hover:bg-blue-700 active:translate-y-0.5 transition-all duration-150 rounded-lg py-2 px-4 capitalize text-sm border border-blue-300 shadow-md"
            >
              {category.replace(/([A-Z])/g, " $1").trim()}
            </button>
          ))}
        </div>

        {picked && (
          <div className="bg-gray-800 border border-blue-400 rounded-xl p-6 text-center shadow-inner relative screen">
            <div className="absolute inset-0 pointer-events-none z-10 opacity-10 bg-[repeating-linear-gradient(to_bottom,white_0px,white_1px,transparent_1px,transparent_3px)] rounded-xl" />
            <h2 className="text-3xl font-bold text-orange-200 mb-2 z-20 relative">{picked.Title}</h2>
            {picked.Year && <p className="text-blue-300 text-lg z-20 relative">({picked.Year})</p>}
            {picked.Description && <p className="mt-3 text-sm text-gray-300 leading-relaxed z-20 relative">{picked.Description}</p>}
            {picked.Poster && (
              <img
                src={picked.Poster}
                alt={picked.Title}
                className="mt-5 rounded-lg max-h-64 mx-auto border border-blue-300 z-20 relative"
              />
            )}
            <p className="text-xs mt-3 text-gray-400 italic z-20 relative">🎲 Category: {picked.type}</p>
          </div>
        )}
      </div>
    </div>
  );
}