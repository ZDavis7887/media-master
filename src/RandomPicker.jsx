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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white font-mono p-6 flex flex-col items-center">
      <div className="bg-orange-500 border-4 border-blue-600 rounded-3xl shadow-2xl p-8 w-full max-w-2xl">
        <h1 className="text-5xl font-bold mb-8 text-center text-shadow-xl drop-shadow-md text-yellow-100">🎮 MEDIA BOY</h1>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {Object.keys(media).map((category) => (
            <button
              key={category}
              onClick={() => pickRandom(category)}
              className="bg-blue-700 hover:bg-blue-800 active:scale-95 transition-transform rounded-xl py-3 px-5 capitalize text-sm text-white shadow-md"
            >
              {category.replace(/([A-Z])/g, " $1").trim()}
            </button>
          ))}
        </div>
        {picked && (
          <div className="bg-gray-800 border border-blue-400 rounded-xl p-6 text-center shadow-inner">
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
            <p className="text-xs mt-3 text-gray-400 italic">🎲 Category: {picked.type}</p>
          </div>
        )}
      </div>
    </div>
  );
}
