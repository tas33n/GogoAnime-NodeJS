const puppeteer = require("puppeteer");

class DoodExtractor {
  constructor(client) {
    this.client = client;
  }

  async videoFromUrl(url, quality = null, redirect = true, externalSubs = []) {
    const newQuality = quality || `Doodstream${redirect ? " mirror" : ""}`;
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: "networkidle2" });

      const newUrl = redirect ? page.url() : url;
      const content = await page.content();

      await browser.close();

      const doodHost = new URL(newUrl).host;
      if (!content.includes("'/pass_md5/")) return null;

      const md5 = content.split("'/pass_md5/")[1].split("',")[0];
      const token = md5.split("/").pop();
      const randomString = this.getRandomString();
      const expiry = Date.now();

      const videoUrlStartResponse = await this.client.get(
        `https://${doodHost}/pass_md5/${md5}`,
        {
          headers: { referer: newUrl },
        }
      );
      const videoUrlStart = videoUrlStartResponse.data;
      const videoUrl = `${videoUrlStart}${randomString}?token=${token}&expiry=${expiry}`;
      console.log(videoUrl);
      return {
        url: newUrl,
        quality: newQuality,
        videoUrl: videoUrl,
        headers: this.doodHeaders(doodHost),
        subtitleTracks: externalSubs,
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async videosFromUrl(url, quality = null, redirect = true) {
    const video = await this.videoFromUrl(url, quality, redirect);
    return video ? [video] : [];
  }

  getRandomString(length = 10) {
    const allowedChars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length }, () =>
      allowedChars.charAt(Math.floor(Math.random() * allowedChars.length))
    ).join("");
  }

  doodHeaders(host) {
    return {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      Referer: `https://${host}/`,
    };
  }
}

module.exports = DoodExtractor;
