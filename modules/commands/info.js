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
 const frames = [
  "⏳ Loading Info...\n[■□□□□□□□□□] 10%",
  "⏳ Loading Info...\n[■■■□□□□□□□] 30%",
  "⏳ Loading Info...\n[■■■■■□□□□□] 50%",
  "⏳ Loading Info...\n[■■■■■■■□□□] 70%",
  "⏳ Loading Info...\n[■■■■■■■■■□] 90%",
  "⏳ Loading Info...\n[■■■■■■■■■■] 100%"
 ];

 let loadingMsg = await api.sendMessage(frames[0], threadID);

 for (let i = 1; i < frames.length; i++) {
  await new Promise(resolve => setTimeout(resolve, 500));
  try { await api.unsendMessage(loadingMsg.messageID); } catch(e) {}
  loadingMsg = await api.sendMessage(frames[i], threadID);
 }

 await new Promise(resolve => setTimeout(resolve, 500));
 try { await api.unsendMessage(loadingMsg.messageID); } catch(e) {}
 // 🔥 Loading Animation End

 const uptime = process.uptime();
 const hours = Math.floor(uptime / 3600);
 const minutes = Math.floor((uptime % 3600) / 60);
 const seconds = Math.floor(uptime % 60);

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
