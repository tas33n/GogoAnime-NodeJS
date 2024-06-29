<h1 align="center">GogoAnime - NodeJS</h1>


<p align="center">
  <img src="https://img.shields.io/badge/version-v1.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/github/license/tas33n/GogoAnime-NodeJS.svg" alt="License">
  <img src="https://img.shields.io/github/issues/tas33n/GogoAnime-NodeJS.svg" alt="issues">
  <img src="https://img.shields.io/github/forks/tas33n/GogoAnime-NodeJS.svg" alt="forks">
  <img src="https://img.shields.io/github/stars/tas33n/GogoAnime-NodeJS.svg" alt="PRs Welcome">
</p>

<p align="center">
    A simple module for Search & Stream animes from GoGoAnime.
</p>

## Table of contents
- [About](#about)
- [Usage](#usage)
- [Contribute](#contribute)
- [License](#license)

## About
I made this module to use in my messenger bot and telegram bots. Since it may usefull to othr so i'm sharing it here. 

## Installation

```bash
npm install tas33n/GogoAnime-NodeJS
```

## Usage:
```js
/* import the library */
const GogoAnime = require("../src/GogoAnime");

async function main() {
  const gogoAnime = new GogoAnime();

  // Example: Fetch popular anime list
  const popularAnimes = await gogoAnime.popularAnimeRequest(1);
  console.log("Popular Animes:", popularAnimes);

  // Example: Fetch latest update anime list
  const latestUpdates = await gogoAnime.latestUpdatesRequest(1);
  console.log("Latest Updates:", latestUpdates);

  // Example: Search for anime
  const searchQuery = "KonoSuba: God's Blessing on This Wonderful World! 2";
  const searchFilters = {};
  const searchAnimeList = await gogoAnime.searchAnimeRequest(
    1,
    searchQuery,
    searchFilters
  );
  console.log("Search Results:", searchAnimeList);

  // Example: Fetch anime details
  // Pass the anime URL slug, e.g., '/category/return-of-the-immortal'
  const animeDetails = await gogoAnime.animeDetailsParse(
    searchAnimeList[0].url
  );
  console.log("Anime Details:", animeDetails);

  // Example: Fetch episode list
  // Pass the anime URL slug, e.g., '/category/return-of-the-immortal'
  const episodeList = await gogoAnime.episodeListParse(searchAnimeList[0].url);
  console.log("Episode List:", episodeList);

  // Example: Fetch video links
  // Pass the anime episode URL slug, e.g., '/return-of-the-immortal-episode-66'
  const videoList = await gogoAnime.videoListParse(episodeList[0].url);
  console.log("Video List:", videoList);
}

main().catch(console.error);

```

## Contribute
Contributions are welcome! Follow these steps to contribute to this project:
1. Fork the project.
2. Create a branch: `git checkout -b feature/NewFeature`.
3. Make the necessary changes and commit: `git commit -am 'Add new feature'`.
4. Push to branch: `git push origin feature/NewFeature`
5. Submit a pull request.

## Credits

- Aniyomi for their goganime-extension - [Aniyomi](https://github.com/aniyomiorg/aniyomi/)

## License
This project is licensed under the MIT licence. See the [LICENSE](LICENSE) file for more details.

## Contact
Tas33n (Lamb3rt) - [tg@lamb3rt](https://t.me/lamb3rt)