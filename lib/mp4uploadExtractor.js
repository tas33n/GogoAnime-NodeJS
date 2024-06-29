const axios = require("axios");
const cheerio = require("cheerio");

class Mp4uploadExtractor {
  constructor(client) {
    this.client = client;
  }

  async videosFromUrl(url, headers, prefix = "", suffix = "") {
    const newHeaders = {
      ...headers,
      referer: Mp4uploadExtractor.REFERER,
    };

    const response = await this.client.get(url, { headers: newHeaders });
    const $ = cheerio.load(response.data);

    let script = $('script:contains("eval"):contains("p,a,c,k,e,d")').html();
    if (script) {
      script = this.unpackAndCombine(script);
    } else {
      script = $('script:contains("player.src")').html();
      if (!script) return [];
    }

    const videoUrl = script
      .split(".src(")[1]
      .split(")")[0]
      .split("src:")[1]
      .split('"')[1]
      .split('"')[0];

    const resolutionMatch = script.match(Mp4uploadExtractor.QUALITY_REGEX);
    const resolution = resolutionMatch
      ? `${resolutionMatch[1]}p`
      : "Unknown resolution";
    const quality = `${prefix}Mp4Upload - ${resolution}${suffix}`;

    return [{ url: videoUrl, quality, headers: newHeaders }];
  }

  unpackAndCombine(script) {
    // Implement the unpacking logic here
    // This is a placeholder for the actual unpacking logic
    return script;
  }

  static get QUALITY_REGEX() {
    return /\WHEIGHT=(\d+)/;
  }

  static get REFERER() {
    return "https://mp4upload.com/";
  }
}

module.exports = Mp4uploadExtractor;
