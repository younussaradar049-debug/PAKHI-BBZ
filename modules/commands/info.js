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

module.exports.run = async function({ api, event }) {

	// 🔥 Loading Animation
	const frames = [
		"𝙇𝙤𝙖𝙙𝙞𝙣𝙜 𝙄𝙣𝙛𝙤...\n[■□□□□□□□□□] 10%",
		"𝙇𝙤𝙖𝙙𝙞𝙣𝙜 𝙄𝙣𝙛𝙤...\n[■■■□□□□□□□] 30%",
		"𝙇𝙤𝙖𝙙𝙞𝙣𝙜 𝙄𝙣𝙛𝙤...\n[■■■■■□□□□□] 50%",
		"𝙇𝙤𝙖𝙙𝙞𝙣𝙜 𝙄𝙣𝙛𝙤...\n[■■■■■■■□□□] 70%",
		"𝙇𝙤𝙖𝙙𝙞𝙣𝙜 𝙄𝙣𝙛𝙤...\n[■■■■■■■■■□] 90%",
		"𝙇𝙤𝙖𝙙𝙞𝙣𝙜 𝙄𝙣𝙛𝙤...\n[■■■■■■■■■■] 100%"
	];

	let msg = await api.sendMessage(frames[0], event.threadID);

	for (let i = 1; i < frames.length; i++) {
		await new Promise(resolve => setTimeout(resolve, 500));
		await api.unsendMessage(msg.messageID);
		msg = await api.sendMessage(frames[i], event.threadID);
	}

	await new Promise(resolve => setTimeout(resolve, 500));
	await api.unsendMessage(msg.messageID);

	// 🔥 Original System
	const time = process.uptime(),
	hours = Math.floor(time / (60 * 60)),
	minutes = Math.floor((time % (60 * 60)) / 60),
	seconds = Math.floor(time % 60);

	const currentTime = moment.tz("Asia/Dhaka").format("『D/MM/YYYY』 【HH:mm:ss】");  

	const message = `
╔═══━━━─── • ───━━━═══╗
   👑 𝗢𝗪𝗡𝗘𝗥 𝗣𝗥𝗢𝗙𝗜𝗟𝗘 👑
╚═══━━━─── • ───━━━═══╝

╭─❖ 𝗕𝗔𝗦𝗜𝗖 𝗜𝗡𝗙𝗢
│ ✦ 𝗡𝗮𝗺𝗲     : 𝗠𝗶𝘀𝘁𝘆 𝗕𝗯𝘇
│ ✦ 𝗔𝗴𝗲      : 18
│ ✦ 𝗥𝗼𝗹𝗲     : 𝗔𝗱𝗺𝗶𝗻
╰───────────────❖

╭─❖ 𝗖𝗢𝗡𝗧𝗔𝗖𝗧
│ 💬 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸 :
│ https://m.me/61564643127325
╰───────────────❖

╭─❖ 𝗦𝗬𝗦𝗧𝗘𝗠 𝗦𝗧𝗔𝗧𝗨𝗦
│ ⏰ 𝗧𝗶𝗺𝗲     : ${currentTime}
│ ⚡ 𝗨𝗽𝘁𝗶𝗺𝗲  : ${hours}h ${minutes}m ${seconds}s
╰───────────────❖

╔═══━━━─── • ───━━━═══╗
𝗧𝗵𝗮𝗻𝗸𝘀 𝗳𝗼𝗿 𝘂𝘀𝗶𝗻𝗴 𝗺𝘆 𝗯𝗼𝘁
╚═══━━━─── • ───━━━═══╝`;

	const cacheDir = path.join(__dirname, "cache");
	const imgPath = path.join(cacheDir, "info.jpg");

	try {
		if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

		// 🔥 Image Download
		const response = await axios({
			url: "https://i.imgur.com/5HD6Alr.jpeg",
			method: "GET",
			responseType: "stream"
		});

		const writer = fs.createWriteStream(imgPath);
		response.data.pipe(writer);

		writer.on("finish", async () => {
			await api.sendMessage(
				{
					body: message,
					attachment: fs.createReadStream(imgPath)
				},
				event.threadID,
				(err, info) => {
					if (!err) {
						setTimeout(() => {
							api.unsendMessage(info.messageID);
						}, 10000);
					}
					fs.unlinkSync(imgPath);
				}
			);
		});

	} catch (error) {
		console.error(error);
		api.sendMessage("❌ Image পাঠানো ব্যর্থ হয়েছে।", event.threadID);
	}
};
