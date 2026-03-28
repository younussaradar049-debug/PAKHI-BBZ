module.exports.config = {
  name: "callad",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Hridoy",
  description: "Report system with reply back (Mirai)",
  commandCategory: "Utility",
  usages: "[message]",
  cooldowns: 5,
  aliases: ["calladmin", "kakashi", "hridoy"]
};

module.exports.run = async function ({ api, event, args, Users }) {
  const ADMIN_THREAD_ID = "25622944850719979";

  if (!args[0]) {
    return api.sendMessage("❌ | Please write your report!", event.threadID, event.messageID);
  }

  const senderID = event.senderID;
  const senderName = await Users.getNameUser(senderID);
  const content = args.join(" ");

  const msg =
`📩 REPORT SYSTEM
━━━━━━━━━━━━━━━━━━
👤 ${senderName}
🆔 ${senderID}

📝 ${content}
━━━━━━━━━━━━━━━━━━
⚡ Reply this message to respond user`;

  api.sendMessage(msg, ADMIN_THREAD_ID, (err, info) => {
    if (err) return api.sendMessage("❌ | Failed to send!", event.threadID);

    // 🔥 IMPORTANT: save reply
    global.client.handleReply.push({
      name: module.exports.config.name,
      messageID: info.messageID,
      author: senderID,
      type: "replyToUser"
    });

    return api.sendMessage("✅ | Report sent to admin!", event.threadID, event.messageID);
  });
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  const { author, type } = handleReply;
  const msg = event.body;

  if (!msg) return;

  // 🔥 Admin reply → user inbox
  if (type === "replyToUser") {
    api.sendMessage(
`📩 Admin Reply
━━━━━━━━━━━━━━━━━━
${msg}
━━━━━━━━━━━━━━━━━━`,
      author
    );

    api.sendMessage("✅ | Reply sent to user!", event.threadID);
  }
};
