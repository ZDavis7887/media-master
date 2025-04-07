import React from "react";
import { useState, useEffect } from "react";

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

  const pickRandom = (type) => {
    const entries = media[type]?.filter((m) =>
      typeof m.Watched === "string" ? m.Watched.toLowerCase() !== "yes" : true
    ) || [];
    const choice = entries[Math.floor(Math.random() * entries.length)];
    setPicked({ ...choice, type });
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-3xl font-bold">🎮 Media Boy Picker</h1>
      <div className="flex flex-wrap gap-2">
        {Object.keys(media).map((category) => (
          <button
            key={category}
            onClick={() => pickRandom(category)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 capitalize"
          >
            {category.replace(/([A-Z])/g, " $1").trim()}
          </button>
        ))}
      </div>
      {picked && (
        <div className="border rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold">{picked.Title}</h2>
          {picked.Year && <p className="text-gray-500">({picked.Year})</p>}
          <p className="text-sm italic mt-1 text-gray-400">Category: {picked.type}</p>
        </div>
      )}
    </div>
  );
}
