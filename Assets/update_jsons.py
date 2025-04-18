import pandas as pd
import json
import os

# Map of output JSON filename to input CSV filepath
csv_files = {
    "cleaned_movies": "Assets/MCGBGTV Master List - Movies.csv",
    "cleaned_books": "Assets/MCGBGTV Master List - Books.csv",
    "games": "Assets/MCGBGTV Master List - Games.csv",
    "comics": "Assets/MCGBGTV Master List - Comics.csv",
    "graphic_novels": "Assets/MCGBGTV Master List - Graphic Novels.csv",
    "shows": "Assets/MCGBGTV Master List - shows.csv",
    "documentaries": "Assets/MCGBGTV Master List - Documentary.csv",
    "Anime Cleaned": "Assets/MCGBGTV Master List - Anime.csv",
    "manga": "Assets/MCGBGTV Master List - Manga.csv"
}

output_dir = "public/data"
os.makedirs(output_dir, exist_ok=True)

def standardize_title_column(df):
    for col in df.columns:
        if col.lower() in ["title", "movies", "movie", "book", "name"]:
            df.rename(columns={col: "Title"}, inplace=True)
            break
    return df

for name, path in csv_files.items():
    try:
        df = pd.read_csv(path)

        df = df.loc[:, ~df.columns.str.contains("^Unnamed")]  # Remove unnamed columns
        df = standardize_title_column(df)
        df = df[df["Title"].notna()]

        # ✅ If anime or manga, drop "Seen" column if it exists
        if name in ["anime", "manga"] and "Seen" in df.columns:
            df = df.drop(columns=["Seen"])

        # Replace NaN with None (null in JSON)
        df = df.astype(object).where(pd.notnull(df), None)

        out_path = os.path.join(output_dir, f"{name}.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(df.to_dict(orient="records"), f, ensure_ascii=False, indent=2)

        print(f"✅ Exported {len(df)} items to {out_path}")

    except Exception as e:
        print(f"❌ Failed to process {name}: {e}")
