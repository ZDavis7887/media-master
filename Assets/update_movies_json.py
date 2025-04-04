import pandas as pd
import json
import numpy as np

csv_path = "Assets/MCGBGTV Master List - Movies.csv"
json_path = "public/data/cleaned_movies.json"

# Load CSV
df = pd.read_csv(csv_path)

# Rename columns if needed
df.rename(columns=lambda x: x.strip(), inplace=True)
df.rename(columns={"Movies": "Title"}, inplace=True)

# Filter and clean
df = df[["Title", "Year", "Watched"]]
df = df[df["Title"].notna()]

# Convert Year to string or null
df["Year"] = df["Year"].apply(lambda x: str(int(x)) if pd.notnull(x) and not isinstance(x, str) else None)

# Convert to dict
records = df.where(pd.notnull(df), None).to_dict(orient="records")

# Save JSON
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(records, f, ensure_ascii=False, indent=2)

print(f"✅ Exported {len(records)} cleaned movie records to cleaned_movies.json")
