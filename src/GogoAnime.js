const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const GogoStreamExtractor = require("../lib/GogoStreamExtractor");
const streamwishExtractor = require("../lib/StreamwishExtractor");
// const doodExtractor = require("../lib/doodExtractor");
const mp4uploadExtractor = require("../lib/mp4uploadExtractor");
const parseCookies = require("../lib/cookieParser");

class GogoAnime {
  constructor() {
    this.name = "Gogoanime";
    this.baseUrl = "https://anitaku.pe";
    this.lang = "en";
    this.supportsLatest = true;
    this.preferences = this.loadPreferences();
    this.AJAX_URL = "https://ajax.gogocdn.net/ajax";
    this.client = axios.create();
    this.gogoStreamExtractor = new GogoStreamExtractor(this.client);
    this.streamwishExtractor = new streamwishExtractor(this.client);
    // this.doodExtractor = new doodExtractor(this.client);
    this.mp4uploadExtractor = new mp4uploadExtractor(this.client);
    this.cookies = parseCookies(path.join(__dirname, "../cookies.txt"));
  }

  loadPreferences() {
    try {
      return JSON.parse(fs.readFileSync("preferences.json", "utf8"));
    } catch (e) {
      return {
        preferred_quality: "1080",
        preferred_server: "Gogostream",
        hoster_selection: [
          "vidcdn",
          "anime",
          // "doodstream",
          "streamwish",
          "mp4upload",
          "filelions",
        ],
      };
    }
  }

  savePreferences() {
    fs.writeFileSync(
      "preferences.json",
      JSON.stringify(this.preferences, null, 2)
    );
  }

  headers() {
    const headers = {
      Origin: this.baseUrl,
      Referer: `${this.baseUrl}/`,
    };

    if (this.cookies) {
      headers.Cookie = this.cookies;
    }

    return headers;
  }

  async popularAnimeRequest(page) {
    const url = `${this.baseUrl}/popular.html?page=${page}`;
    const response = await axios.get(url, { headers: this.headers() });
    const $ = cheerio.load(response.data);

    const animeList = $(this.popularAnimeSelector())
      .map((i, element) => {
        const $element = $(element);
        return {
          url: $element.attr("href"),
          thumbnail_url: $element.find("img").attr("src"),
          title: $element.attr("title"),
        };
      })
      .get();

    const hasNextPage = $(this.popularAnimeNextPageSelector()).length > 0;

    return {
      animeList,
      hasNextPage,
    };
  }

  popularAnimeSelector() {
    return "div.img a";
  }

  popularAnimeNextPageSelector() {
    return "ul.pagination-list li:last-child:not(.selected)";
  }

  async latestUpdatesRequest(page) {
    const url = `${this.baseUrl}/home.html?page=${page}`;
    const response = await axios.get(url, { headers: this.headers() });
    const $ = cheerio.load(response.data);

    const updatesList = $(this.latestUpdatesSelector())
      .map((i, element) => {
        const $element = $(element);
        const href = $element.attr("href");
        const slug = href
          .substring(this.baseUrl.length)
          .replace(/^\//, "")
          .split("-episode-")[0];
        return {
          url: `/category/${slug}`,
          thumbnail_url: $element.find("img").attr("src"),
          title: $element.attr("title"),
        };
      })
      .get();

    const hasNextPage = $(this.latestUpdatesNextPageSelector()).length > 0;

    return {
      updatesList,
      hasNextPage,
    };
  }

  latestUpdatesSelector() {
    return "div.img a";
  }

  latestUpdatesNextPageSelector() {
    return this.popularAnimeNextPageSelector();
  }

  getSearchParameters(filters) {
    return {
      genre: filters.genre || "",
      recent: filters.recent || "",
      season: filters.season || "",
      filter: filters.filter || "",
    };
  }

  async searchAnimeRequest(page, query, filters) {
    const params = this.getSearchParameters(filters);
    let url;
    if (params.genre) {
      url = `${this.baseUrl}/genre/${params.genre}?page=${page}`;
    } else if (params.recent) {
      url = `${this.AJAX_URL}/page-recent-release.html?page=${page}&type=${params.recent}`;
    } else if (params.season) {
      url = `${this.baseUrl}/${params.season}?page=${page}`;
    } else {
      url = `${this.baseUrl}/filter.html?keyword=${query}&${params.filter}&page=${page}`;
    }
    const response = await axios.get(url, { headers: this.headers() });

    const $searchAnime = cheerio.load(response.data);
    const searchAnimeElements = $searchAnime(
      this.searchAnimeSelector()
    ).toArray();
    const searchAnimeList = searchAnimeElements.map((el) =>
      this.searchAnimeFromElement(el)
    );

    return searchAnimeList;
  }

  popularAnimeFromElement(element) {
    const $element = cheerio.load(element);
    return {
      url: $element("a").attr("href"),
      thumbnail_url: $element("img").attr("src"),
      title: $element("a").attr("title"),
    };
  }

  searchAnimeSelector() {
    return this.popularAnimeSelector();
  }

  searchAnimeFromElement(element) {
    return this.popularAnimeFromElement(element);
  }

  async animeDetailsParse(url) {
    const infoDocument = await axios
      .get(`${this.baseUrl}/${url}`, { headers: this.headers() })
      .then((res) => cheerio.load(res.data));

    return {
      title: infoDocument("div.anime_info_body_bg > h1").text(),
      genre: this.getInfo(infoDocument, "Genre:"),
      status: this.parseStatus(this.getInfo(infoDocument, "Status:")),
      description: this.buildDescription(infoDocument),
    };
  }

  buildDescription(infoDocument) {
    const summary = infoDocument(
      "div.anime_info_body_bg > div.description"
    ).text();
    const otherName = this.getInfo(infoDocument, "Other name:");
    return `${summary}${otherName ? `\n\nOther name(s): ${otherName}` : ""}`;
  }

  async episodeListParse(url) {
    const episodeListPage = await axios.get(`${this.baseUrl}/${url}`, {
      headers: this.headers(),
    });
    const $ = cheerio.load(episodeListPage.data);
    const totalEpisodes = $(this.episodeListSelector()).last().attr("ep_end");
    const id = $("input#movie_id").attr("value");
    return this.episodesRequest(totalEpisodes, id);
  }

  episodeListSelector() {
    return "ul#episode_page li a";
  }

  episodeFromElement(element) {
    const $element = cheerio.load(element);
    const epText = $element("div.name").text();
    const ep = epText.substring(epText.indexOf(" ") + 1);
    return {
      url: $element("a").attr("href").trim(),
      episode_number: parseFloat(ep),
      name: `Episode ${ep}`,
    };
  }

  async episodesRequest(totalEpisodes, id) {
    const url = `${this.AJAX_URL}/load-list-episode?ep_start=0&ep_end=${totalEpisodes}&id=${id}`;
    const response = await axios.get(url, { headers: this.headers() });
    const $ = cheerio.load(response.data);
    return $("a")
      .map((i, el) => this.episodeFromElement(el))
      .get();
  }

  async videoListParse(url) {
    const videoListPage = await axios.get(`${this.baseUrl}${url}`, {
      headers: this.headers(),
    });

     // Save the player response for debugging purposes
    //  const filePath = path.join(__dirname, 'animeDetails.html');
    //  fs.writeFileSync(filePath, videoListPage.data);

    const $ = cheerio.load(videoListPage.data);
    const hosterSelection = this.preferences.hoster_selection;

    const videoPromises = $("div.anime_muti_link > ul > li")
      .map(async (i, server) => {
        const className = $(server).attr("class");
        if (!hosterSelection.includes(className)) return [];
        const serverUrl = $(server).find("a").attr("data-video");
        return this.getHosterVideos(className, serverUrl);
      })
      .get();

      const downloadLinks = [];
      $("div.list_dowload").each((index, element) => {
        const links = $(element).find("a");
        if (links.length > 1) {
          links.each((i, link) => {
            downloadLinks.push({
              res: $(link).text().trim(),
              url: $(link).attr("href"),
            });
          });
        } else {
          const message = $(element).text().trim();
          downloadLinks.push({ message });
        }
      });

    const videoLists = await Promise.all(videoPromises);
    return {
      videos: videoLists.flat(),
      download: downloadLinks,
    };
  }

  async getHosterVideos(className, serverUrl) {
    switch (className) {
      case "anime":
      case "vidcdn":
      case "s3taku":
        return this.gogoStreamExtractor.videosFromUrl(serverUrl);
      case "streamwish":
      case "awish":
        return this.streamwishExtractor.videosFromUrl(serverUrl);
      case "doodstream":
      // case "dood":
      // return this.doodExtractor.videosFromUrl(serverUrl);  // cloudflare blocked
      case "mp4upload":
        return this.mp4uploadExtractor.videosFromUrl(serverUrl, this.headers());
      case "filelions":
        return this.streamwishExtractor.videosFromUrl(
          serverUrl,
          (quality) => `FileLions - ${quality}`
        );
      default:
        return [];
    }
  }

  getInfo(document, text) {
    const base = document(`p.type:has(span:contains(${text}))`);
    return base.find("a").text() || base.text();
  }

  parseStatus(statusString) {
    switch (statusString) {
      case "Ongoing":
        return "ONGOING";
      case "Completed":
        return "COMPLETED";
      default:
        return "UNKNOWN";
    }
  }
}

module.exports = GogoAnime;
