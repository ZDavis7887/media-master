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
    "documentaries": "Assets/MCGBGTV Master List - Documentary.csv"
}

output_dir = "public/data"
os.makedirs(output_dir, exist_ok=True)

# Normalize title column for all CSVs
def standardize_title_column(df):
    for col in df.columns:
        if col.lower() in ["title", "movies", "movie", "book", "name"]:
            df.rename(columns={col: "Title"}, inplace=True)
            break
    return df

for name, path in csv_files.items():
    try:
        df = pd.read_csv(path)

        # Drop any unnamed index columns
        df = df.loc[:, ~df.columns.str.contains("^Unnamed")]

        # Standardize column name to "Title"
        df = standardize_title_column(df)

        # Filter out entries without titles
        df = df[df["Title"].notna()]

        # Convert all NaN/NaT to None (→ null in JSON)
        df = df.astype(object).where(pd.notnull(df), None)

        # Save to JSON
        out_path = os.path.join(output_dir, f"{name}.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(df.to_dict(orient="records"), f, ensure_ascii=False, indent=2)

        print(f"✅ Exported {len(df)} items to {out_path}")

    except Exception as e:
        print(f"❌ Failed to process {name}: {e}")
