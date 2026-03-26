module.exports.config = {
 name: "info",
 version: "1.0.0",
 hasPermssion: 0,
 credits: "HRIDOY",
 description: "Bot information command",
 commandCategory: "Admin",
 hide: true,
 usages: "",
 cooldowns: 5,
};

module.exports.run = async function ({ api, event, args, Users, Threads }) {
 const { threadID } = event;
 const request = global.nodemodule["request"];
 const fs = global.nodemodule["fs-extra"];
 const moment = require("moment-timezone");

 const { configPath } = global.client;
 delete require.cache[require.resolve(configPath)];
 const config = require(configPath);

 const { commands } = global.client;
 const threadSetting = (await Threads.getData(String(threadID))).data || {};
 const prefix = threadSetting.hasOwnProperty("PREFIX") ? threadSetting.PREFIX : config.PREFIX;

 // 🔥 Loading Animation Start
 const progress = [
        "[■□□□□□□□□□] 10%",
        "[■■■□□□□□□□] 30%",
        "[■■■■■□□□□□] 50%",
        "[■■■■■■■□□□] 70%",
        "[■■■■■■■■■□] 90%",
        "[■■■■■■■■■■] 100%"
    ];

 let loading = await api.sendMessage(
      `𝙇𝙤𝙖𝙙𝙞𝙣𝙜 𝗜𝗻𝗳𝗼...\n\n${progress[0]}`,
      threadID
 );

 for (let i = 1; i < progress.length; i++) {
      await new Promise(r => setTimeout(r, 500));
      // ❗ edit message in place
      if (api.editMessage) {
        await api.editMessage(
          `𝙇𝙤𝙖𝙙𝙞𝙣𝙜 𝗜𝗻𝗳𝗼...\n\n${progress[i]}`,
          loading.messageID
        );
      } else {
        // fallback if editMessage not available
        await api.unsendMessage(loading.messageID);
        loading = await api.sendMessage(
          `𝙇𝙤𝙖𝙙𝙞𝙣𝙜 𝗜𝗻𝗳𝗼...\n\n${progress[i]}`,
          threadID
        );
      }
 }

 await new Promise(r => setTimeout(r, 500));
 try { await api.unsendMessage(loading.messageID); } catch(e) {}

 // 🔥 Prepare info
 const uptime = process.uptime();
 const hours = Math.floor(uptime / 3600);
 const minutes = Math.floor((uptime % 3600) / 60);
 const seconds = Math.floor(uptime % 60);

 const timeNow = moment.tz("Asia/Dhaka").format("DD/MM/YYYY HH:mm:ss");
 const h = hours, m = minutes, s = seconds;

 const totalUsers = global.data.allUserID.length;
 const totalThreads = global.data.allThreadID.length;

 const msg = `
╔════ INFO ════╗

Name: Misty Bbz
Age: 18
Role: Admin

Facebook:
https://m.me/61564643127325

Time: ${timeNow}
Uptime: ${h}h ${m}m ${s}s

╚══════════════╝
`;

 const imgLinks = [
 "https://i.imgur.com/5HD6Alr.jpeg"
 ];

 const imgLink = imgLinks[Math.floor(Math.random() * imgLinks.length)];

 const callback = () => {
 api.sendMessage({
   body: msg,
   attachment: fs.createReadStream(__dirname + "/cache/info.jpg")
 }, threadID, () => fs.unlinkSync(__dirname + "/cache/info.jpg"));
 };

 return request(encodeURI(imgLink))
   .pipe(fs.createWriteStream(__dirname + "/cache/info.jpg"))
   .on("close", callback);
};
