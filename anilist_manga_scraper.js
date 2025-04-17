// anilist_manga_scraper.js
import fetch from 'node-fetch';
import { writeFileSync } from 'fs';

const query = `
query ($page: Int) {
  Page(page: $page, perPage: 50) {
    media(type: MANGA, sort: SCORE_DESC, averageScore_greater: 74) {
      title {
        romaji
      }
      averageScore
    }
    pageInfo {
      hasNextPage
    }
  }
}
`;

async function fetchManga(page) {
  const res = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { page } }),
  });
  return res.json();
}

async function getAllManga() {
  let page = 1;
  let mangaList = [];
  let hasNextPage = true;

  while (hasNextPage) {
    console.log(`Fetching page ${page}...`);
    const data = await fetchManga(page);

    if (data?.data?.Page?.media?.length) {
      mangaList.push(...data.data.Page.media);
      hasNextPage = data.data.Page.pageInfo.hasNextPage;
      page++;
    } else {
      hasNextPage = false;
    }
  }

  console.log(`Fetched ${mangaList.length} manga entries.`);

  // Convert to CSV
  const csvContent = mangaList.map(m => `"${m.title.romaji}"`).join("\n");
  writeFileSync('anime_manga_list.csv', csvContent);
  console.log('✅ Saved as anime_manga_list.csv');
}

getAllManga();
