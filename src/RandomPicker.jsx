import React, { useState, useEffect } from "react";

export default function RandomPicker() {
  const [movies, setMovies] = useState([]);
  const [picked, setPicked] = useState(null);

  useEffect(() => {
    fetch("/data/cleaned_movies.json")
      .then((res) => res.json())
      .then((data) => setMovies(data))
      .catch((err) => console.error("Failed to load movie data:", err));
  }, []);

  const pickRandom = () => {
    const choice = movies[Math.floor(Math.random() * movies.length)];
    setPicked(choice);
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-3xl font-bold">🎬 Random Movie Picker</h1>
      <button
        onClick={pickRandom}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Pick a Movie
      </button>
      {picked && (
        <div className="border rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold">{picked.Title}</h2>
          {picked.Year && <p className="text-gray-500">({picked.Year})</p>}
        </div>
      )}
    </div>
  );
}
