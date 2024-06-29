const axios = require("axios");
const cheerio = require("cheerio");
const extractFromHls = require("./extractFromHls");

class StreamWishExtractor {
  constructor(client, headers) {
    this.client = client;
    this.headers = headers;
  }

  async videosFromUrl(url, prefix) {
    return this.videosFromUrlWithGen(
      url,
      (quality) => `${prefix} - ${quality}`
    );
  }

  async videosFromUrlWithGen(
    url,
    videoNameGen = (quality) => `StreamWish - ${quality}`
  ) {
    const response = await this.client.get(url, { headers: this.headers });
    const $ = cheerio.load(response.data);

    let scriptBody = $("script:contains('m3u8')").html();
    if (scriptBody && scriptBody.includes("eval(function(p,a,c")) {
      scriptBody = this.unpackScript(scriptBody);
    }

    const masterUrl = scriptBody
      ? scriptBody.split("source")[1]?.split('file:"')[1]?.split('"')[0]
      : "";

    if (!masterUrl) return [];

    return extractFromHls(masterUrl, url, videoNameGen);
  }

  unpackScript(script) {
    const unpacked = script.match(/eval\(function\(p,a,c,k,e,d\)\{.*\}\)\)/);
    if (unpacked) {
      const unpackedScript = eval(unpacked[0]);
      return unpackedScript;
    }
    return script;
  }
}

module.exports = StreamWishExtractor;
