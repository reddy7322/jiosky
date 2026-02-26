export default async function handler(req, res) {
  try {
    const API_URL = "https://gist.githubusercontent.com/AlloTomato/6f8f29bd39339b38959888ea3948cdfe/raw/tplayygxapidata.json";
    const KEY_BASE = "https://tvtskey.vercel.app/key/";

    const response = await fetch(API_URL);
    const data = await response.json();
    const channels = data?.data?.channels || [];

    let output = `#EXTM3U\n\n`;

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
      } catch (e) {
        continue;
      }

      if (!clearkey) continue;

      output += `#KODIPROP:inputstream.adaptive.manifest_type=mpd\n`;
      output += `#KODIPROP:inputstream.adaptive.license_type=clearkey\n`;
      output += `#KODIPROP:inputstream.adaptive.license_key=${clearkey}\n`;

      output += `#EXTINF:-1 tvg-id="ts${id}" group-title="${genre}" tvg-logo="${logo}",${name}\n`;

      output += `${manifest}|User-Agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"&Origin="https://watch.tataplay.com"&Referer="https://watch.tataplay.com/"\n\n`;
    }

    res.setHeader("Content-Type", "application/x-mpegURL");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).send(output);

  } catch (error) {
    res.status(500).send("Playlist generation failed");
  }
}
