const GogoAnime = require("./src/GogoAnime");

async function main() {
  const gogoAnime = new GogoAnime();

  // // Example: Fetch popular anime list
  // const popularAnimes = await gogoAnime.popularAnimeRequest(1);
  // console.log("Popular Animes:", popularAnimes);

  // // Example: Fetch latest update anime list
  // const latestUpdates = await gogoAnime.latestUpdatesRequest(1);
  // console.log("Latest Updates:", latestUpdates);

  // // Example: Search for anime
  // const searchQuery = "KonoSuba: God's Blessing on This Wonderful World! 2";
  // const searchFilters = {};
  // const searchAnimeList = await gogoAnime.searchAnimeRequest(
  //   1,
  //   searchQuery,
  //   searchFilters
  // );
  // console.log("Search Results:", searchAnimeList);

  // // Example: Fetch anime details
  // // Pass the anime URL slug, e.g., '/category/return-of-the-immortal'
  // const animeDetails = await gogoAnime.animeDetailsParse(
  //   searchAnimeList[0].url
  // );
  // console.log("Anime Details:", animeDetails);

  // // Example: Fetch episode list
  // // Pass the anime URL slug, e.g., '/category/return-of-the-immortal'
  // const episodeList = await gogoAnime.episodeListParse(searchAnimeList[0].url);
  // console.log("Episode List:", episodeList);

  // Example: Fetch video links
  // Pass the anime episode URL slug, e.g., '/return-of-the-immortal-episode-66'
  const videoList = await gogoAnime.videoListParse('/kono-subarashii-sekai-ni-shukufuku-wo-2-episode-2');
  console.log("Video List:", videoList);
}

main().catch(console.error);
