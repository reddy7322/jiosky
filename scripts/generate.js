import fs from "fs";

const API_URL = "https://gist.githubusercontent.com/AlloTomato/6f8f29bd39339b38959888ea3948cdfe/raw/tplayygxapidata.json";
const KEY_BASE = "https://tvtskey.vercel.app/key/";

async function generatePlaylist() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    const channels = data?.data?.channels || [];

    let output = "#EXTM3U\n\n";

    for (const ch of channels) {
      const id = ch.id;
      const name = ch.name;
      const manifest = ch.manifest_url;
      const logo = ch.logo || "";
      const genre = ch.genre && ch.genre !== "null" ? ch.genre : "Other";

      if (!manifest || !id) continue;

      let clearkey = "";
      try {
        const keyRes = await fetch(`${KEY_BASE}${id}`);
        const keyJson = await keyRes.json();

        if (keyJson?.keys?.length > 0) {
          const kid = keyJson.keys[0].kid;
          const key = keyJson.keys[0].k;
          clearkey = `${kid}:${key}`;
        }
      } catch {
        continue;
      }

      if (!clearkey) continue;

      output += `#KODIPROP:inputstream.adaptive.manifest_type=mpd\n`;
      output += `#KODIPROP:inputstream.adaptive.license_type=clearkey\n`;
      output += `#KODIPROP:inputstream.adaptive.license_key=${clearkey}\n`;
      output += `#EXTINF:-1 tvg-id="ts${id}" group-title="${genre}" tvg-logo="${logo}",${name}\n`;
      output += `${manifest}\n\n`;
    }

    fs.writeFileSync("./public/play.m3u", output);
    console.log("play.m3u generated successfully");

  } catch (error) {
    console.error("Generation failed:", error);
  }
}

generatePlaylist();
