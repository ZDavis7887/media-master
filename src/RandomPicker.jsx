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
  const COMICVINE_API_KEY = import.meta.env.VITE_COMICVINE_API_KEY;

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

    if ((type === "comics" || type === "graphicNovels") && choice?.Title) {
      const cleanedTitle = cleanTitle(choice.Title);
      try {
        const response = await fetch(
          `http://localhost:3001/comicvine?query=${encodeURIComponent(cleanedTitle)}`
        );
        const data = await response.json();

        if (data.results?.length) {
          const comic = data.results[0];
          choice.Description = comic.deck || comic.description || "No description found.";
          choice.Poster = comic.image?.super_url;
          choice.Year = comic.cover_date?.slice(0, 4);
        }
      } catch (err) {
        console.error("ComicVine fetch failed:", err);
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
            <p className="text-xs mt-3 text-gray-400 italic">🎲 Category: {picked.type}</p>
          </div>
        )}
      </div>
    </div>
  );
}
