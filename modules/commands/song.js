const axios = require("axios");
const fs = require("fs");
const path = require("path");

// ✅ FIXED base API URL
const baseApiUrl = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json"
  );
  return base.data.api;
};

module.exports.config = {
  name: "song",
  version: "2.3.2",
  aliases: ["music", "sing"],
  credits: "Hridoy (fixed)",
  countDown: 5,
  hasPermssion: 0,
  description: "Download audio from YouTube",
  commandCategory: "media",
  usages: "{pn} [song name or YouTube link]"
};

module.exports.run = async function ({ api, args, event }) {

  const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))((\w|-){11})/;

  if (!args[0]) {
    return api.sendMessage(
      "🎵 | গান নাম বা YouTube link দাও",
      event.threadID,
      event.messageID
    );
  }

  const filePath = path.join(__dirname, "cache", "song.mp3");

  const searchingMsg = await api.sendMessage(
    "🔍 | Searching... please wait",
    event.threadID
  );

  try {
    let videoID;
    const isUrl = checkurl.test(args[0]);

    // ================= URL MODE =================
    if (isUrl) {
      const match = args[0].match(checkurl);
      videoID = match ? match[1] : null;

      const res = await axios.get(
        `${await baseApiUrl()}/ytDl3?link=${videoID}&format=mp3`
      );

      const { title, downloadLink, quality } = res.data;

      await downloadAudio(downloadLink, filePath);

      await api.unsendMessage(searchingMsg.messageID);

      return api.sendMessage(
        {
          body: `🎧 Title: ${title}\n🎶 Quality: ${quality}`,
          attachment: fs.createReadStream(filePath)
        },
        event.threadID,
        () => fs.unlinkSync(filePath),
        event.messageID
      );
    }

    // ================= SEARCH MODE =================
    const keyword = encodeURIComponent(args.join(" "));
    const search = await axios.get(
      `${await baseApiUrl()}/ytFullSearch?songName=${keyword}`
    );

    if (!search.data || search.data.length === 0) {
      await api.unsendMessage(searchingMsg.messageID);
      return api.sendMessage(
        "❌ | কোনো গান পাওয়া যায়নি",
        event.threadID,
        event.messageID
      );
    }

    const first = search.data[0];

    const res = await axios.get(
      `${await baseApiUrl()}/ytDl3?link=${first.id}&format=mp3`
    );

    const { title, downloadLink, quality } = res.data;

    await downloadAudio(downloadLink, filePath);

    await api.unsendMessage(searchingMsg.messageID);

    return api.sendMessage(
      {
        body: `🎧 Title: ${title}\n📺 Channel: ${first.channel.name}\n🎶 Quality: ${quality}`,
        attachment: fs.createReadStream(filePath)
      },
      event.threadID,
      () => fs.unlinkSync(filePath),
      event.messageID
    );

  } catch (err) {
    console.error(err);
    await api.unsendMessage(searchingMsg.messageID);
    return api.sendMessage(
      "⚠️ | Error while processing song",
      event.threadID,
      event.messageID
    );
  }
};

// ✅ DOWNLOAD FUNCTION FIXED
async function downloadAudio(url, filePath) {
  const res = await axios.get(url, { responseType: "arraybuffer" });
  fs.writeFileSync(filePath, Buffer.from(res.data));
      }
