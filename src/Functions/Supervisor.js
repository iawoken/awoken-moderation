const { Client, MessageEmbed, WebhookClient } = require("discord.js");
const moment = require("moment");
require("moment-duration-format");
moment.locale("tr");
const Database = require("../Models/Restriction")

module.exports = (fs, Config, client = process.client) => {
  const Supervisor = (process.supervisor = new Client({ disableMentions: "everyone", ignoreDirect: true, ignoreRoles: true, fetchAllMembers: true }));
  Supervisor.login(Config.Import.Supervisor.Token);
  let Guild;
  
  Supervisor.once("ready", () => {
    console.log(`${Supervisor.user.tag} - ${Supervisor.user.id} | Supervisor client active.`);
    Guild = Supervisor.guilds.cache.get(Config.Guild.GuildID) || Supervisor.guilds.cache.first();
    Supervisor.user.setPresence({
      activity: { name: Config.Import.Presence.name, type: Config.Import.Presence.type },
      status: Config.Import.Presence.status
    });
  }); 
function ChatMute() {
Database.find({Activity: true, Type: "MUTE"}, (err, res) => {
  if ((!res) || (res.length < 1)) return null;
  res.forEach(user => {
      let Target = Guild.members.cache.get(user.userID);
      if (Date.now() >= user.FinishDate) {
      if ((Target) && (Target.roles.cache.has(Config.CezaRoles.MuteRoles))) Target.roles.remove(Config.CezaRoles.MuteRoles).catch(() => { });
        user.Activity = false;
        user.save();
    } else {
      if ((Target) && (!Target.roles.cache.has(Config.CezaRoles.MuteRoles))) Target.roles.add(Config.CezaRoles.MuteRoles).catch(() => { });
    }
  });
});
}
function VMute() {
Database.find({Activity: true, Type: "VMUTE"}, async (err,res) => {
  if ((!res) || (res.length < 1)) return null;
    res.forEach(user => {
      let Target = Guild.members.cache.get(user.userID);
      if (Date.now() >= user.FinishDate) {
      if ((Target) && (Target.voice.channel) && (Target.voice.serverMute)) Target.voice.setMute(false).catch(() => { });
        user.Activity = false;
        user.save();
    } else {
      if ((Target) && (Target.voice.channel) && (!Target.voice.serverMute)) Target.voice.setMute(true).catch(() => { });
    }
  });
});
}
function Jail() {
Database.find({Activity: true, Type: "JAIL"}, async (err,res) => {
  if ((!res) || (res.length < 1)) return null;
    res.forEach(user => {
      let Target = Guild.members.cache.get(user.userID);
      if ((Target) && (!Target.roles.cache.has(Config.CezaRoles.JailRoles))) Target.roles.set(Target.roles.cache.get(Config.Roles.Booster) ? [Config.Roles.Booster, Config.CezaRoles.JailRoles] : [Config.CezaRoles.JailRoles]).catch(() => { });
    });
  });
} 
  
function PermaMute() {
Database.find({Activity: true, Type: "PERMAMUTE"}, async (err,res) => {
  if ((!res) || (res.length < 1)) return null;
    res.forEach(user => {
      let Target = Guild.members.cache.get(user.userID);
      if ((Target) && (!Target.roles.cache.has(Config.CezaRoles.MuteRoles))) Target.roles.add(Config.CezaRoles.MuteRoles).catch(() => { });
    });
  });
} 
  
function VPermaMute() {
Database.find({Activity: true, Type: "PERMAVMUTE"}, async (err,res) => {
  if ((!res) || (res.length < 1)) return null;
    res.forEach(user => {
      let Target = Guild.members.cache.get(user.userID);
      if ((Target) && (Target.voice.channel) && (!Target.serverMute)) Target.voice.setMute(true).catch(() => { });
    });
  });
} 
  

async function voiceLog(channel, oldChannel, newChannel) {
  if (!channel) return null;
    if (!oldChannel.channel && newChannel.channel) return channel.send({
      embeds: [
        client.VoiceEmbed(`${newChannel.guild.members.cache.get(newChannel.id)} (\`${newChannel.id}\`) üyesi \`${newChannel.channel.name}\` adlı kanala giriş yaptı.`, newChannel.member)
      ]
    }).catch(() => { });
    if (oldChannel.channel && !newChannel.channel) return channel.send({
      embeds: [
        client.VoiceEmbed(`${newChannel.guild.members.cache.get(newChannel.id)} (\`${newChannel.id}\`) üyesi \`${oldChannel.channel.name}\` adlı kanaldan çıkış yaptı.`, newChannel.member)
      ]
    }).catch(() => { });
    if (oldChannel.channelID !== newChannel.channelID) return channel.send({
      embeds: [
        client.VoiceEmbed(`${newChannel.guild.members.cache.get(newChannel.id)} (\`${newChannel.id}\`) üyesi \`${oldChannel.channel.name}\` adlı kanaldan \`${newChannel.channel.name}\` adlı kanala geçiş yaptı.`, newChannel.member)
      ]
    }).catch(() => { });
  }

  async function checkVoiceMute (oldState, newState) {
    let member = newState.member;
    if (!member) return null;
    Database.find({Activity: true, Type: "VMUTE"}, async (err, res) => {
      if ((!res) || (res.length < 1)) return null;
      if (res.some(x => x.userID === member.id)) {
        let Data = res.find(x => x.userID === member.id);
        if (Date.now() >= Data.FinishDate) {
          member.voice.setMute(false);
          Data.Activity = false;
          Data.save();
        } else if ((member.voice.channel) && (!member.voice.serverMute)) {
          member.voice.setMute(true);
        };
      };
    });
  };
  
async function Welcome (member) {
   const CezaList = await Database.find({ userID: member.id, Activity: true});
   let sure = (new Date().getTime() - member.user.createdAt.getTime());
   if ((CezaList) && (CezaList.some(x  => x.Type === "JAIL"))) return member.roles.add(Config.CezaRoles.JailRoles).catch(() => { });
   if ((CezaList) && (CezaList.some(x  => x.Type === "BAN"))) return member.ban({reason: "Forbidden Member"});
   if (sure >= client.getDate(1, "hafta")) {
    await member.roles.add(Config.Roles.Unregister).catch(() => { });
    if ((member.user.username.includes(Config.Tags.OrjTag)) && (Config.Tags.OrjTag !== "")) member.roles.add(Config.Tags.TagRoles).catch(() => { });
    if ((CezaList) && (CezaList.some(x  => x.Type === "MUTE"))) return member.roles.add(Config.CezaRoles.MuteRoles).catch(() => { });
      client.message(`:tada: Sunucumuza hoş geldin ${member.user.toString()}. Seninle beraber ${member.guild.memberCount} kişi olduk!
      
${client.react("star")} Hesabın **${moment(member.user.createdAt).format('LLL')}** tarihinde (${client.tarih(member.user.createdAt)}) oluşturulmuş.

${client.react("star")} Sunucu kurallarımız <#${Config.Guild.Rules}> kanalında belirtilmiştir. Unutma sunucu içerisinde ki ceza işlemlerin kuralları okuduğunu varsayarak gerçekleştirilecek.

${client.react("star")} Tagımızı (\`${Config.Tags.OrjTag}\`) alarak bizlere destek olabilirsin! Kayıt olmak için teyit odalarına girip ses teyit vermen gerekiyor yetkililerimiz seninle ilgilenecektir! İyi eğlenceler. ${client.react("star")}`, Config.Guild.Welcome);
   } else {
   await member.roles.add(Config.CezaRoles.Karantina).catch(() => { });
    client.message(new MessageEmbed().setDescription(`${member} (\`${member.id}\`) üyesi sunucuya katıldı fakat hesabı \`${moment(member.user.createdAt).format('LLL')}\` (${client.tarih(member.user.createdAt)}) tarihinde açıldığı için <@&${Config.CezaRoles.Karantina}> rolü verildi!`)
    .setAuthor(member.user.tag, member.user.displayAvatarURL({dynamic: true}))
    .setColor('#460707')
    .setThumbnail(member.guild.iconURL({ dynamic: true })), Config.Guild.Welcome);
  };
};
  
async function UserUpdate (member) {
  let Target = Guild.members.cache.get(member.id);
  if ((Target.user.username.includes(Config.Tags.OrjTag)) && (!Target.roles.cache.get(Config.Tags.TagRoles))) {
    let Nickname = Target.displayName.replace(Config.Tags.FakeTag, Config.Tags.OrjTag)
    if ((Target.manageable) && (Target.displayName.includes(Config.Tags.FakeTag))) Target.setNickname(Nickname).catch(() => {});
    let Verilmicek = [Config.CezaRoles.JailRoles, Config.CezaRoles.Karantina]
    if (Target.roles.cache.some(x => Verilmicek.includes(x.id))) return;
    await Target.roles.add(Config.Tags.TagRoles).catch(() => { });
  } else if ((!Target.user.username.includes(Config.Tags.OrjTag)) && (Target.roles.cache.get(Config.Tags.TagRoles))) {
    let Nickname = Target.displayName.replace(Config.Tags.OrjTag, Config.Tags.FakeTag);
    if ((Target.managable) && (!Target.displayName.inclues(Config.Tags.OrjTag))) Target.setNickname(Nickname).catch(() => {});
    Target.roles.cache.filter(x => Guild.roles.cache.get("").rawPosition < x.position).map(x => Target.roles.remove(x)).catch(() => { });
    if ((Config.Guild.TagIntake) == true){
     Target.roles.cache.has(Config.Roles.Booster) || Target.roles.cache.has(Config.Roles.Vip) ? await Target.roles.remove([Config.Tags.TagRoles]) : Target.roles.set(Config.Roles.Unregister).catch(() => { }); 
    } else { 
      await Target.roles.remove(Config.Tags.TagRoles).catch(() => { });
    };
  };
  const embed = new MessageEmbed().setAuthor(Target.user.tag, Target.user.avatarURL({ dynamic: true })).setDescription(`${Target} (\`${Target.id}\`) üyesi tagımızı(\`${Config.Tags.OrjTag}\`) ${Target.user.username.includes(Config.Tags.OrjTag) ? "alarak ailemize katıldı." : "çıkartarak ailemizden ayrıldı."}`).setColor(client.Renk[Math.floor(Math.random() * client.Renk.length)]);
  return client.WebhookSend(embed, Config.TagLog.id, Config.Guild.TagLog.token, true);
};
  
async function TagCheck () {
  if (Guild) {
   let unRoles = Config.CezaRoles.filter(x => x != "MuteRoles").map(x => Config.CezaRoles[x])
   
    Guild.members.cache.filter(x => (!unRoles.some(v => x.roles.cache.has(v))) && (x.user.username.includes(Config.Tags.OrjTag)) && (!x.roles.cache.has(Config.Tags.TagRoles))).forEach((member, index) => {
      setTimeout(() => {
        member.roles.add(Config.Tags.TagRoles).catch(() => { });
      }, index* 750);
    });
    Guild.members.cache.filter(x => unRoles.some(v => x.roles.cache.has(v)) || ((!x.user.username.includes(Config.Tags.OrjTag)) && (x.roles.cache.has(Config.Tags.TagRoles)))).forEach((member, index) => {
      setTimeout(async () => {
        if ((Config.Guild.TagIntake) == true) {
          member.roles.cache.has(Config.Roles.Booster) || member.roles.cache.has(Config.Roles.Vip) ? await member.roles.remove([Config.Tags.TagRoles]) : member.roles.set(Config.Roles.Unregister).catch(() => { }); 
         } else {
          member.roles.remove(Config.Tags.TagRoles).catch(() => { });
         };
      }, index* 750);
    });
  };
};

async function MessageLog (hook) {
 if (!hook) return null; 
  Supervisor.on("messageDelete", async (message) => {
    if ((message.author.bot) || (message.channel.type == "dm")) return;
     if (message.attachments.first()) {
      hook.send({
        embeds: [{
          description: `${message.channel} kanalında ${message.author} tarafından bir fotoğraf silindi.\n Silinen Fotoğraf:`,
          footer: { text: "Silindiği Saat:" },
          timestamp: new Date(),
          author: { name: message.author.tag, icon_url: message.author.displayAvatarURL({dynamic:true}) },
          thumbnail: { url: message.author.displayAvatarURL({dynamic:true}) },
          image: { url: message.attachments.first().proxyURL },
          color: Math.floor(Math.random() * (0xffffff + 1))
        }]
      }).catch(() => { });
    } else {
      hook.send({
        embeds: [{
          color: Math.floor(Math.random() * (0xffffff + 1)),
          footer: { text: "Silindiği Saat:" },
          timestamp: new Date(),
          author: { name: message.author.tag, icon_url: message.author.avatarURL({dynamic:true})},
          thumbnail: { url: message.author.avatarURL({dynamic:true}) },
           fields: [
           { name: "`Silinen Mesaj:`", value: `**${message.content}**`, inline: true },
           { name: "`Mesajın Sahibi:`", value: `${message.author}`, inline: true },
           { name: "`Mesajın Kanalı:`", value: `${message.channel}`, inline: true },
           { name: "`Tarih:`", value: client.toDate(new Date()), inline: true }
         ],
        }]
      }).catch(() => { });
    } 
  })
  
  Supervisor.on("messageUpdate", async (old, nev) => {
    if ((nev.author.bot) || (nev.channel.type === "dm") || old.content.toLowerCase() === nev.content.toLowerCase()) return;
    hook.send({
      embeds: [{
        title: `[Mesaj Düzenlendi]`,
        fields: [
          { name: "`Eski Mesaj:`", value: `**${old.content}**`, inline: true },
          { name: "`Yeni Mesaj:`", value: `**${nev.content}**`, inline: true },
          { name: "`Mesajın Sahibi:`", value: `${nev.author}`, inline: true },
          { name: "`Mesajın Kanalı:`", value: `${nev.channel}`, inline: true },
          { name: "`Tarih:`", value: client.toDate(new Date()), inline: true }
        ],
        color: Math.floor(Math.random() * (0xffffff + 1)),
        author: { name: nev.guild.name, icon_url: nev.guild.iconURL({dynamic:true}) },
        thumbnail: { url: nev.author.avatarURL({dynamic:true}) },
        timestamp: new Date()
      }]
    });
  });
};

  

  
Supervisor.once("ready", async () => {
  const Hook = new WebhookClient(Config.MsgLog.id, Config.MsgLog.token);
  await MessageLog(Hook);
  setInterval(() => ChatMute(), client.getDate(5, "saniye"));
  setInterval(() => VMute(), client.getDate(5, "saniye"));
  setInterval(() => Jail(), client.getDate(3, "dakika"));
  setInterval(() => TagCheck(), client.getDate(15, "dakika"));
  setInterval(() => PermaMute(), client.getDate(5, "saniye"));
  setInterval(() => PermaMute(), client.getDate(5, "saniye"));
});  
Supervisor.on("userUpdate", async (oldMember, newMember) => await UserUpdate(newMember));
Supervisor.on("guildMemberAdd", async member => await Welcome(member));
Supervisor.on("voiceStateUpdate", async (oldChannel, newChannel) => {
  const Hook = new WebhookClient(Config.VoiceLog.id, Config.VoiceLog.token);
  await voiceLog(Hook, oldChannel, newChannel);
  await checkVoiceMute(oldChannel, newChannel)
}); 
};
