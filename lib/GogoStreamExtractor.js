const axios = require("axios");
const cheerio = require("cheerio");
const crypto = require("crypto");
const { URL } = require("url");
const extractFromHls = require("./extractFromHls");

class GogoStreamExtractor {
  constructor(client) {
    this.client = client;
  }

  async videosFromUrl(serverUrl) {
    try {
      const response = await this.client.get(serverUrl);
      const $ = cheerio.load(response.data);

      const iv = this.getBytesAfter(
        $("div.wrapper").attr("class"),
        "container-"
      );
      const secretKey = this.getBytesAfter(
        $("body[class]").attr("class"),
        "container-"
      );
      const decryptionKey = this.getBytesAfter(
        $("div.videocontent").attr("class"),
        "videocontent-"
      );

      const decryptedAjaxParams = this.cryptoHandler(
        $("script[data-value]").attr("data-value"),
        iv,
        secretKey,
        false
      ).substring(
        this.cryptoHandler(
          $("script[data-value]").attr("data-value"),
          iv,
          secretKey,
          false
        ).indexOf("&") + 1
      );

      const url = new URL(serverUrl);
      const host = `${url.protocol}//${url.host}`;
      const id = url.searchParams.get("id");

      if (!id) throw new Error("error getting id");
      const encryptedId = this.cryptoHandler(id, iv, secretKey);
      const token = url.searchParams.get("token");
      const qualityPrefix = token ? "Gogostream - " : "Vidstreaming - ";

      const jsonResponse = await this.client.get(
        `${host}/encrypt-ajax.php?id=${encryptedId}&${decryptedAjaxParams}&alias=${id}`,
        { headers: { "X-Requested-With": "XMLHttpRequest" } }
      );

      const data = jsonResponse.data.data;
      const sourceList = JSON.parse(
        this.cryptoHandler(data, iv, decryptionKey, false)
      ).source;

      if (sourceList.length === 1 && sourceList[0].type === "hls") {
        const playlistUrl = sourceList[0].file;
        return extractFromHls(playlistUrl, serverUrl, qualityPrefix);
      } else {
        return sourceList.map((video) => ({
          file: video.file,
          label: `${qualityPrefix}${video.label}`,
          headers: { Referer: serverUrl },
        }));
      }
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  getBytesAfter(str, item) {
    return Buffer.from(
      str.substring(str.indexOf(item) + item.length).replace(/\D/g, "")
    );
  }

  cryptoHandler(string, iv, secretKey, encrypt = true) {
    const ivBuffer = Buffer.from(iv);
    const secretKeyBuffer = Buffer.from(secretKey);
    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      secretKeyBuffer,
      ivBuffer
    );

    if (!encrypt) {
      const decipher = crypto.createDecipheriv(
        "aes-256-cbc",
        secretKeyBuffer,
        ivBuffer
      );
      return Buffer.concat([
        decipher.update(Buffer.from(string, "base64")),
        decipher.final(),
      ]).toString();
    } else {
      return Buffer.concat([
        cipher.update(Buffer.from(string)),
        cipher.final(),
      ]).toString("base64");
    }
  }
}

module.exports = GogoStreamExtractor;
