const axios = require("axios");
const fs = require("fs");
const path = require("path");

let simsim = "";
let count_req = 0;

// ===== VIP System Helpers =====
const vipFilePath = path.join(__dirname, "../../modules/commands/rx/vip.json");
const vipModePath = path.join(__dirname, "../../modules/commands/rx/vipMode.json");

const loadVIP = () => {
    if (!fs.existsSync(vipFilePath)) return [];
    try {
        return JSON.parse(fs.readFileSync(vipFilePath, "utf-8"));
    } catch {
        return [];
    }
};

const loadVIPMode = () => {
    if (!fs.existsSync(vipModePath)) return false;
    try {
        const data = JSON.parse(fs.readFileSync(vipModePath, "utf-8"));
        return data.vipMode || false;
    } catch {
        return false;
    }
};

// Check if user is allowed when VIP mode is ON
const isAllowed = (senderID) => {
    const vipList = loadVIP();
    const vipMode = loadVIPMode();

    // Admin (hasPermssion: 3) সবসময় allowed
    if (global.config.ADMINBOT && global.config.ADMINBOT.includes(senderID)) {
        return true;
    }

    if (!vipMode) return true;           // VIP mode off থাকলে সবাই ব্যবহার করতে পারবে
    return vipList.includes(senderID);   // VIP mode on থাকলে শুধু VIP ইউজার
};
// ===== End VIP Helpers =====

async function sendTypingIndicatorV2(sendTyping, threadID) {
    try {
        var wsContent = {
            app_id: 2220391788200892,
            payload: JSON.stringify({
                label: 3,
                payload: JSON.stringify({
                    thread_key: threadID.toString(),
                    is_group_thread: +(threadID.toString().length >= 16),
                    is_typing: +sendTyping,
                    attribution: 0
                }),
                version: 5849951561777440
            }),
            request_id: ++count_req,
            type: 4
        };
        await new Promise((resolve, reject) =>
            mqttClient.publish('/ls_req', JSON.stringify(wsContent), {}, (err, _packet) =>
                err ? reject(err) : resolve()
            )
        );
    } catch (err) {
        console.log("⚠️ Typing indicator error:", err.message);
    }
}

(async () => {
    try {
        const res = await axios.get("https://raw.githubusercontent.com/abdullahrx07/X-api/main/MaRiA/baseApiUrl.json");
        if (res.data && res.data.mari) simsim = res.data.mari;
    } catch {}
})();

module.exports.config = {
    name: "baby",
    aliases: ["pakhi", ""],
    premium: false,
    version: "1.2.0",
    hasPermssion: 0,
    credits: "rX",
    description: "AI Chat with Teach, List, Edit support + VIP Mode",
    commandCategory: "Utility",
    usages: "[query]",
    cooldowns: 0,
    prefix: false
};

module.exports.run = async function ({ api, event, args, Users }) {
    const uid = event.senderID;
    if (!isAllowed(uid)) return;   // VIP Check

    const senderName = await Users.getNameUser(uid);
    const query = args.join(" ").toLowerCase();

    try {
        if (!simsim) return api.sendMessage("❌ API not loaded yet.", event.threadID, event.messageID);

        // Sub Commands
        if (args[0] === "autoteach") {
            const mode = args[1];
            if (!["on", "off"].includes(mode))
                return api.sendMessage("✅ Use: baby autoteach on/off", event.threadID, event.messageID);

            const status = mode === "on";
            await axios.post(`${simsim}/setting`, { autoTeach: status });
            return api.sendMessage(`✅ Auto teach is now ${status ? "ON 🟢" : "OFF 🔴"}`, event.threadID, event.messageID);
        }

        if (args[0] === "list") {
            const res = await axios.get(`${simsim}/list`);
            return api.sendMessage(
                `╭─╼🌟 𝐁𝐚𝐛𝐲 𝐀𝐈 𝐒𝐭𝐚𝐭𝐮𝐬\n├ 📝 𝐓𝐞𝐚𝐜𝐡𝐞𝐝 𝐐𝐮𝐞𝐬𝐭𝐢𝐨𝐧𝐬: ${res.data.totalQuestions}\n├ 📦 𝐒𝐭𝐨𝐫𝐞𝐝 𝐑𝐞𝐩𝐥𝐢𝐞𝐬: ${res.data.totalReplies}\n╰─╼👤 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫: 𝐫𝐗`,
                event.threadID,
                event.messageID
            );
        }

        if (args[0] === "msg") {
            const trigger = args.slice(1).join(" ").trim();
            if (!trigger) return api.sendMessage("❌ | Use: baby msg [trigger]", event.threadID, event.messageID);

            const res = await axios.get(`\( {simsim}/simsimi-list?ask= \){encodeURIComponent(trigger)}`);
            if (!res.data.replies || res.data.replies.length === 0)
                return api.sendMessage("❌ No replies found.", event.threadID, event.messageID);

            const formatted = res.data.replies.map((rep, i) => `➤ ${i + 1}. ${rep}`).join("\n");
            const msg = `📌 𝗧𝗿𝗶𝗴𝗴𝗲𝗿: ${trigger.toUpperCase()}\n📋 𝗧𝗼𝘁𝗮𝗹: \( {res.data.total}\n━━━━━━━━━━━━━━\n \){formatted}`;
            return api.sendMessage(msg, event.threadID, event.messageID);
        }

        if (args[0] === "teach") {
            const parts = query.replace("teach ", "").split(" - ");
            if (parts.length < 2)
                return api.sendMessage("❌ | Use: teach [Question] - [Reply]", event.threadID, event.messageID);

            const [ask, ans] = parts;
            const res = await axios.get(`\( {simsim}/teach?ask= \){encodeURIComponent(ask)}&ans=\( {encodeURIComponent(ans)}&senderID= \){uid}&senderName=${encodeURIComponent(senderName)}`);
            return api.sendMessage(`✅ ${res.data.message}`, event.threadID, event.messageID);
        }

        if (args[0] === "edit") {
            const parts = query.replace("edit ", "").split(" - ");
            if (parts.length < 3)
                return api.sendMessage("❌ | Use: edit [Question] - [OldReply] - [NewReply]", event.threadID, event.messageID);

            const [ask, oldR, newR] = parts;
            const res = await axios.get(`\( {simsim}/edit?ask= \){encodeURIComponent(ask)}&old=\( {encodeURIComponent(oldR)}&new= \){encodeURIComponent(newR)}`);
            return api.sendMessage(res.data.message, event.threadID, event.messageID);
        }

        if (["remove", "rm"].includes(args[0])) {
            const parts = query.replace(/^(remove|rm)\s*/, "").split(" - ");
            if (parts.length < 2)
                return api.sendMessage("❌ | Use: remove [Question] - [Reply]", event.threadID, event.messageID);

            const [ask, ans] = parts;
            const res = await axios.get(`\( {simsim}/delete?ask= \){encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}`);
            return api.sendMessage(res.data.message, event.threadID, event.messageID);
        }

        // Normal chat
        if (!query) {
            const texts = ["Hey baby 💖", "Yes, I'm here 😘"];
            const reply = texts[Math.floor(Math.random() * texts.length)];
            return api.sendMessage(reply, event.threadID);
        }

        await sendTypingIndicatorV2(true, event.threadID);
        await new Promise(r => setTimeout(r, 2000));
        await sendTypingIndicatorV2(false, event.threadID);

        const res = await axios.get(`\( {simsim}/simsimi?text= \){encodeURIComponent(query)}&senderName=${encodeURIComponent(senderName)}`);
        return api.sendMessage(res.data.response, event.threadID, (err, info) => {
            if (!err) {
                global.client.handleReply.push({
                    name: module.exports.config.name,
                    messageID: info.messageID,
                    author: event.senderID,
                    type: "simsimi"
                });
            }
        }, event.messageID);

    } catch (e) {
        return api.sendMessage(`❌ Error: ${e.message}`, event.threadID, event.messageID);
    }
};

module.exports.handleReply = async function ({ api, event, Users }) {
    const uid = event.senderID;
    if (!isAllowed(uid)) return;

    const senderName = await Users.getNameUser(uid);
    const text = event.body?.toLowerCase();
    if (!text || !simsim) return;

    try {
        await sendTypingIndicatorV2(true, event.threadID);
        await new Promise(r => setTimeout(r, 2000));
        await sendTypingIndicatorV2(false, event.threadID);

        const res = await axios.get(`\( {simsim}/simsimi?text= \){encodeURIComponent(text)}&senderName=${encodeURIComponent(senderName)}`);
        return api.sendMessage(res.data.response, event.threadID, (err, info) => {
            if (!err) {
                global.client.handleReply.push({
                    name: module.exports.config.name,
                    messageID: info.messageID,
                    author: event.senderID,
                    type: "simsimi"
                });
            }
        }, event.messageID);
    } catch (e) {
        return api.sendMessage(`❌ Error: ${e.message}`, event.threadID, event.messageID);
    }
};

module.exports.handleEvent = async function ({ api, event, Users }) {
    const text = event.body?.toLowerCase().trim();
    if (!text || !simsim) return;

    const uid = event.senderID;
    if (!isAllowed(uid)) return;   // VIP Check - সবচেয়ে গুরুত্বপূর্ণ

    const senderName = await Users.getNameUser(uid);
    const triggers = ["baby", "bby", "bot", "bbz", "pakhi", "toru"];

    // তোমার দেওয়া সব replies এখানে
    if (triggers.includes(text)) {
        const replies = [
            "𝐀𝐬𝐬𝐚𝐥𝐚𝐦𝐮 𝐰𝐚𝐥𝐚𝐢𝐤𝐮𝐦 ♥",
            "𝒀𝒆𝒔 𝑩𝒃𝒛 🎀",
            "𝐁𝐨𝐥𝐨 𝐣𝐚𝐧 𝐤𝐢 𝐤𝐨𝐫𝐭𝐞 𝐩𝐚𝐫𝐢 𝐭𝐨𝐦𝐫 𝐣𝐨𝐧𝐧𝐨 🐸",
            "𝗜’𝗺 𝗻𝗼𝘁 𝗼𝗽𝘁𝗶𝐨𝐧 , 𝗜’𝗺 𝗽𝗿𝗶𝗼𝗿𝗶𝘁𝘆 💞",
            "𝗕𝗯𝘆 𝗯𝗯𝘆 𝗻𝗮 𝗸𝗼𝗿𝗲𝗲 🥳 𝗔𝗺𝗮𝗿 𝗕𝗼𝘀𝘀 𝗣𝗮𝗸𝗵𝗶  𝗞𝗲 𝗝𝗮𝗺𝗮𝗶 𝗸𝗵𝘂𝗷𝗲 𝗗𝗲𝗻___ ᥫ᭡❤😛",
            "𝐋𝐞𝐦𝐨𝐧 𝐭𝐮𝐬 🍋",
            "𝗛𝗲𝘆 𝗯𝗯𝘆 😛 𝗔𝗶 𝗝𝗲𝗲 𝗮𝗺𝗶𝗶 😇",
            ".__𝐚𝐦𝐤𝐞 𝐬𝐞𝐫𝐞 𝐝𝐞𝐰 𝐚𝐦𝐢 𝐌𝐢𝐬𝐭𝐲'𝐫 𝐤𝐚𝐬𝐞 𝐣𝐚𝐛𝐨!!🥺.....😗",
            "𝐎𝐢 𝐗𝐚𝐧 😗 𝐏𝐚𝐚𝐤𝐡𝐢 𝐢𝐬 𝐇𝐞𝐫𝐞 💫",
            "──‎ 𝐇𝐮𝐌..? 👉👈",
            "𝗛𝗲𝘆 𝗕𝗯𝘆💫 𝗜'𝗺 𝗣𝗮𝗸𝗵𝗶 𝗕𝗯𝘇 😛",
            "কি হলো, মিস টিস করচ্ছো নাকি 🤣",
            "𝐓𝐫𝐮𝐬𝐭 𝐦𝐞 𝐢𝐚𝐦 𝐏𝐚𝐤𝐡𝐢 𝐁𝐛𝐳 🧃",
            "𝐇ᴇʏ 𝐗ᴀɴ 𝐈’𝗺 𝐏𝐚𝐚𝐤𝐡𝐢 𝐁𝐚𝐛𝐲✨ 👀"
        ];

        const reply = replies[Math.floor(Math.random() * replies.length)];

        await sendTypingIndicatorV2(true, event.threadID);
        await new Promise(r => setTimeout(r, 5000));
        await sendTypingIndicatorV2(false, event.threadID);

        return api.sendMessage(reply, event.threadID, (err, info) => {
            if (!err) {
                global.client.handleReply.push({
                    name: module.exports.config.name,
                    messageID: info.messageID,
                    author: event.senderID,
                    type: "simsimi"
                });
            }
        });
    }

    // Prefix দিয়ে কথা বললে (baby ki khobor etc.)
    const matchPrefix = /^(baby|bby|bot|bbz|pakhi|toru)\s+/i;
    if (matchPrefix.test(text)) {
        const query = text.replace(matchPrefix, "").trim();
        if (!query) return;

        await sendTypingIndicatorV2(true, event.threadID);
        await new Promise(r => setTimeout(r, 5000));
        await sendTypingIndicatorV2(false, event.threadID);

        try {
            const res = await axios.get(`\( {simsim}/simsimi?text= \){encodeURIComponent(query)}&senderName=${encodeURIComponent(senderName)}`);
            return api.sendMessage(res.data.response, event.threadID, (err, info) => {
                if (!err) {
                    global.client.handleReply.push({
                        name: module.exports.config.name,
                        messageID: info.messageID,
                        author: event.senderID,
                        type: "simsimi"
                    });
                }
            }, event.messageID);
        } catch (e) {
            return api.sendMessage(`❌ Error: ${e.message}`, event.threadID, event.messageID);
        }
    }

    // Auto Teach
    if (event.type === "message_reply") {
        try {
            const setting = await axios.get(`${simsim}/setting`);
            if (!setting.data.autoTeach) return;

            const ask = event.messageReply.body?.toLowerCase().trim();
            const ans = event.body?.toLowerCase().trim();
            if (!ask || !ans || ask === ans) return;

            setTimeout(async () => {
                try {
                    await axios.get(`\( {simsim}/teach?ask= \){encodeURIComponent(ask)}&ans=\( {encodeURIComponent(ans)}&senderName= \){encodeURIComponent(senderName)}`);
                    console.log("✅ Auto-taught:", ask, "→", ans);
                } catch (err) {
                    console.error("❌ Auto-teach internal error:", err.message);
                }
            }, 300);
        } catch (e) {
            console.log("❌ Auto-teach setting error:", e.message);
        }
    }
};
