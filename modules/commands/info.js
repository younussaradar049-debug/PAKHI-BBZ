const fs = require("fs");
const path = require("path");
const axios = require("axios");
const moment = require("moment-timezone");

module.exports.config = {
  name: "info",
  version: "1.0.3",
  hasPermssion: 0,
  credits: "rX Abdullah",
  description: "Admin.",
  commandCategory: "Admin",
  cooldowns: 1
};

module.exports.run = async function ({ api, event }) {

  // 🔥 Smooth Loading (same msg feel)
  const frames = [
    "Loading Info...\n[■□□□□□□□□□] 10%",
    "Loading Info...\n[■■■□□□□□□□] 30%",
    "Loading Info...\n[■■■■■□□□□□] 50%",
    "Loading Info...\n[■■■■■■■□□□] 70%",
    "Loading Info...\n[■■■■■■■■■□] 90%",
    "Loading Info...\n[■■■■■■■■■■] 100%"
  ];

  let msg = await api.sendMessage(frames[0], event.threadID);

  for (let i = 1; i < frames.length; i++) {
    await new Promise(r => setTimeout(r, 600));

    try {
      await api.unsendMessage(msg.messageID);
    } catch(e) {}

    msg = await api.sendMessage(frames[i], event.threadID);
  }

  await new Promise(r => setTimeout(r, 500));
  try {
    await api.unsendMessage(msg.messageID);
  } catch(e) {}

  // 🔥 Time
  const uptime = process.uptime();
  const h = Math.floor(uptime / 3600);
  const m = Math.floor((uptime % 3600) / 60);
  const s = Math.floor(uptime % 60);

  const timeNow = moment.tz("Asia/Dhaka").format("DD/MM/YYYY HH:mm:ss");

  const text = `╔════ INFO ════╗

Name: Misty Bbz
Age: 18
Role: Admin

Facebook:
https://m.me/61564643127325

Time: ${timeNow}
Uptime: ${h}h ${m}m ${s}s

╚══════════════╝`;

  // 🔥 Image Download FIX
  const dir = path.join(__dirname, "cache");
  const file = path.join(dir, "img.jpg");

  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);

    const response = await axios({
      url: "https://i.imgur.com/5HD6Alr.jpeg",
      method: "GET",
      responseType: "arraybuffer"
    });

    fs.writeFileSync(file, response.data);

    await api.sendMessage(
      {
        body: text,
        attachment: fs.createReadStream(file)
      },
      event.threadID,
      (err, info) => {
        if (!err) {
          setTimeout(() => {
            api.unsendMessage(info.messageID);
          }, 10000);
        }
        fs.unlinkSync(file);
      }
    );

  } catch (e) {
    console.error(e);
    api.sendMessage("❌ Image send failed!", event.threadID);
  }
};
