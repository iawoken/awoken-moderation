class AFK {
    constructor () {
      (this.name = "afk", this.alias = []);
    };
  
    async event (client, ms = require("parse-ms"), Database = require("../Models/Member")) {
      client.on("message", async (msg) => {
      if (msg.author.bot || msg.channel.type === "dm" || msg.guild.id !== client.config.Guild.GuildID) return null;  
      const target = msg.guild.member(msg.mentions.members.first()); 
      Database.findOne({SunucuID: msg.guild.id, userID: msg.author.id}, async (err, res) => {
        if (res) {
          let AfkData = res.AFK || {};
          if (AfkData.Mode) {
            res.AFK = {};
            res.save();
            if (msg.member.manageable) msg.member.setNickname(msg.member.displayName.replace("[AFK]", "")).catch(() => { });
            client.message(`${msg.author} AFK modundan başarıyla çıkış yaptın.`, msg.channel.id, 5000);
          }
        };
      });
      if ((target) && (target.id !== msg.author.id)) {
        const data = await Database.findOne({SunucuID: msg.guild.id, userID: target.id}).exec();
        if (data) {
          let AfkData2 = data.AFK || {};
            if (AfkData2.Mode) {
              let reason = AfkData2.Reason;
              let süre = ms(Date.now() - AfkData2.Date);
              if (süre.days !== 0) {
                msg.channel.send(`${target} \`${süre.days} gün ${süre.hours} saat\` önce AFK moduna geçti. Sebep: (\`${reason}\)`, {  disableMentions: "everyone" }).then(x => x.delete({timeout: 6000})).catch(() => { });
                return;
              } else if (süre.hours !== 0) {
                msg.channel.send(`${target} \`${süre.hours} saat ${süre.minutes} dakika\` önce AFK moduna geçti. Sebep: (\`${reason}\`)`, {  disableMentions: "everyone" }).then(x => x.delete({timeout: 6000})).catch(() => { });
                return;
              } else if (süre.minutes !== 0) {
                msg.channel.send(`${target} \`${süre.minutes} dakika\` önce AFK moduna geçti. Sebep: (\`${reason}\`)`, {  disableMentions: "everyone" }).then(x => x.delete({timeout: 6000})).catch(() => { });
                return;
              } else if (süre.seconds !== 0) {
                msg.channel.send(`${target} \`biraz önce\` AFK moduna geçti. Sebep: (\`${reason}\`)`, {  disableMentions: "everyone" }).then(x => x.delete({timeout: 6000})).catch(() => { });
                return;
              };
            };
          };
        };
      });
    };
      
    async operate ({ client, message, args, config, member, author }, Database = require("../Models/Member")) {
     if (client.AFKMembers2.has(author.id)) return null;
     const reason = (args.join(" ") || "Şu anda AFK'yım en kısa sürede geri döneceğim.").replace("`", "");
      if ((client.ReklamMembers.has(author.id)) && (reason.includes("discord.gg") || reason.includes("@everyone") || reason.includes("@here") || reason.includes(message.mentions.roles.first()))) return message.guild.members.ban(author.id, { reason: "reklam", days: 7});
      if (reason.includes(message.mentions.users.first())) return null;
      if (reason.includes("discord.gg") || reason.includes("@everyone") || reason.includes("@here") || reason.includes(message.mentions.roles.first())) {
        message.delete({timeout: 10});
        message.reply("`AFK` **moduna giriş yaparken link veya etiket (`@everyone, @Rol`) atamazsın.**", { disableMentions: "all" }).then(m => m.delete({ timeout: 3500 })).catch(() => { });
        client.ReklamMembers.add(author.id);
        return;
      }; 
      Database.findOne({SunucuID: message.guild.id, userID: author.id}, async (err,res) => {
        if (!res) {
          new Database({SunucuID: message.guild.id, userID: author.id, AFK: { Mode: true, Reason: reason, Date: Date.now()}}).save();
          if ((author.manageable) && (author.displayName.length < 28)) author.setNickname(`[AFK] ${author.displayName}`).catch(() => { });
          message.reply(`Başarıyla AFK moduna geçtin ve mesajını şu şekilde ayarladım (\`${reason}\`).`, { disableMentions: "all" }).then(m => m.delete({ timeout: 5500 })).catch(() => { });
        } else if ((res) && (!res.AFK) || (!res.AFK.Mode)) {
          res.AFK = { Mode: true, Reason: reason, Date: Date.now() }
          res.save();
          if ((author.manageable) && (author.displayName.length < 28)) author.setNickname(`[AFK] ${author.displayName}`).catch(() => { });
          message.reply(`Başarıyla AFK moduna geçtin ve mesajını şu şekilde ayarladım (\`${reason}\`).`, { disableMentions: "all" }).then(m => m.delete({ timeout: 5500 })).catch(() => { });
        };
      });
  };
}


module.exports = AFK;