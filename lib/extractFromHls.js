// extractFromHls.js
const axios = require("axios");
const { URL } = require("url");

async function extractFromHls(playlistUrl, referer, qualityPrefix) {
  try {
    const response = await axios.get(playlistUrl, {
      headers: { Referer: referer },
    });
    const masterPlaylist = response.data;

    // Check if there isn't multiple streams available
    if (!masterPlaylist.includes("#EXT-X-STREAM-INF:")) {
      return [
        {
          file: playlistUrl,
          label: qualityPrefix + "Video",
          headers: { Referer: referer },
          hls: playlistUrl,
        },
      ];
    }

    const playlistBaseUrl = new URL(playlistUrl).origin;

    const videoList = masterPlaylist
      .split("#EXT-X-STREAM-INF:")
      .slice(1)
      .map((stream) => {
        const resolution = stream.match(/RESOLUTION=\d+x(\d+)/)[1].concat("p");
        const videoUrl = stream.split("\n")[1].trim();
        const absoluteVideoUrl = videoUrl.startsWith("http")
          ? videoUrl
          : `${playlistBaseUrl}${videoUrl}`;

        return {
          file: absoluteVideoUrl,
          label: qualityPrefix + resolution,
          headers: { Referer: referer },
          hls: playlistUrl,
        };
      });

    return videoList;
  } catch (error) {
    console.log(error);
    return [];
  }
}

module.exports = extractFromHls;