const GogoAnime = require("../src/GogoAnime");

test('Fetch popular anime list', async () => {
  const gogoAnime = new GogoAnime();
  const popularAnimes = await gogoAnime.popularAnimeRequest(1);
  console.log("Popular Animes:", popularAnimes);
  expect(popularAnimes).toBeDefined();
});

test('Fetch latest update anime list', async () => {
  const gogoAnime = new GogoAnime();
  const latestUpdates = await gogoAnime.latestUpdatesRequest(1);
  console.log("Latest Updates:", latestUpdates);
  expect(latestUpdates).toBeDefined();
});

test('Search for anime', async () => {
  const gogoAnime = new GogoAnime();
  const searchQuery = "KonoSuba: God's Blessing on This Wonderful World! 2";
  const searchFilters = {};
  const searchAnimeList = await gogoAnime.searchAnimeRequest(1, searchQuery, searchFilters);
  console.log("Search Results:", searchAnimeList);
  expect(searchAnimeList).toBeDefined();
});

test('Fetch anime details', async () => {
  const gogoAnime = new GogoAnime();
  const searchQuery = "KonoSuba: God's Blessing on This Wonderful World! 2";
  const searchFilters = {};
  const searchAnimeList = await gogoAnime.searchAnimeRequest(1, searchQuery, searchFilters);
  const animeDetails = await gogoAnime.animeDetailsParse(searchAnimeList[0].url);
  console.log("Anime Details:", animeDetails);
  expect(animeDetails).toBeDefined();
});

test('Fetch episode list', async () => {
  const gogoAnime = new GogoAnime();
  const searchQuery = "KonoSuba: God's Blessing on This Wonderful World! 2";
  const searchFilters = {};
  const searchAnimeList = await gogoAnime.searchAnimeRequest(1, searchQuery, searchFilters);
  const episodeList = await gogoAnime.episodeListParse(searchAnimeList[0].url);
  console.log("Episode List:", episodeList);
  expect(episodeList).toBeDefined();
});

test('Fetch video links', async () => {
  const gogoAnime = new GogoAnime();
  const searchQuery = "KonoSuba: God's Blessing on This Wonderful World! 2";
  const searchFilters = {};
  const searchAnimeList = await gogoAnime.searchAnimeRequest(1, searchQuery, searchFilters);
  const episodeList = await gogoAnime.episodeListParse(searchAnimeList[0].url);
  const videoList = await gogoAnime.videoListParse(episodeList[0].url);
  console.log("Video List:", videoList);
  expect(videoList).toBeDefined();
});