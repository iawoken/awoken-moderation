const { MessageEmbed , WebhookClient} = require("discord.js");
const Database = require("../Models/Restriction.js");
const Schema = require("../Models/Member.js");
const moment = require("moment");
require("moment-duration-format");
moment.locale("tr");

module.exports = (client, fs, config) => {

  require("./Supervisor.js")(fs, config);
   client.Renk = new Array("#1f0524", "#0b0067", "#4a0038", "#07052a", "#FFDF00", "#00FFFF", "#0091CC", "#0047AB", "#384B77", "#ffffff", "#000000", "#04031a", "#f9ffba");

    client.message = (Content, Channel, Timeout) => {
    const channel = client.channels.cache.get(Channel);
      if (!Timeout) {
        if (channel) channel.send(Content).catch(() => { });
      } else {
        if (channel) channel.send(Content).then((msg) => msg.delete({ timeout: Timeout })).catch(() => { });
      }
    };
  
   client.WebhookSend = (content, id, token, embed) => {
    const Hook = new WebhookClient(id,token);
    if (embed === true) Hook.send([content]).catch(() => { });
    else Hook.send(content).catch(() => { });
    }
  
    client.tepki = (msg, emoji, content, time) => {
     if (time) {
      if (!content) msg.react(client.react(emoji)).catch(() => { })
      else {
      msg.react(client.react(emoji)).catch(() => { });
       client.message(content, msg.channel.id, 5000);
      };
     } else {
      if (!content) {
        msg.react(client.react(emoji)).catch(() => { });
      } else {
        msg.react(client.react(emoji)).catch(() => { });
        client.message(content, msg.channel.id, 5000);
      } 
     }
    }
    
    client.SayiPlus = async (Message, Database, Type) => {
      Database.findOne({SunucuID: Message.guild.id, userID: Message.author.id}, async (err,res) => {
        if (!res) {
          if (Type == "erkek") {
            new Database({ SunucuID: Message.guild.id, userID: Message.author.id, Authorized: { Man: 1 }}).save();
          } else if (Type == "kız") {
            new Database({ SunucuID: Message.guild.id, userID: Message.author.id, Authorized: { Woman: 1 }}).save();
          } else if (Type == "mute") {
            new Database({ SunucuID: Message.guild.id, userID: Message.author.id, RestNumber: { MuteNumber: 1 } }).save();
          } else if (Type == "vmute") {
            new Database({ SunucuID: Message.guild.id, userID: Message.author.id, RestNumber: { VMuteNumber: 1 } }).save();
          } else if (Type == "jail") {
            new Database({ SunucuID: Message.guild.id, userID: Message.author.id, RestNumber: { JailNumber: 1 } }).save();
          };
        } else {
          if (Type == "erkek") {
            res.Authorized.Man++
            res.save();
          } else if (Type == "kız") {
            res.Authorized.Woman++
            res.save();
          } else if (Type == "mute") {
            res.RestNumber.MuteNumber++;
            res.save();
          } else if (Type == "vmute") {
            res.RestNumber.VMuteNumber++;
            res.save();
          } else if (Type == "jail") {
            res.RestNumber.JailNumber++;
            res.save();
          }
        }; 
      });
    }
    
     client.format = sure => {
       return moment.duration(sure).format("D [gün,] H [saat,] m [dakika,] s [saniye.]");
    };

  
    client.cezaPuanı = async (member, sayi) => {
      const Veri = await Schema.findOne({SunucuID: config.Guild.GuildID, userID: member.id});
      if (!Veri) (new Schema({ SunucuID: config.Guild.GuildID, userID: member.id, CezaPuan: sayi}).save())
      else {
        Veri.CezaPuan = Veri.CezaPuan + sayi
        Veri.save();
      }
    }
    client.cezaPuanCheck = async (member) => {
      const Veri = await Schema.findOne({SunucuID: config.Guild.GuildID, userID: member.id}).exec();
      let CezaPuanList;
      if ((!Veri) || (!Veri.CezaPuan)) CezaPuanList = { "Puan": 0, "Rutbe": "Nötr" }
      else { 
        if (Veri.CezaPuan > 0) CezaPuanList = { "Puan": Veri.CezaPuan, "Rutbe": "Agresif"}
        if (Veri.CezaPuan > 100) CezaPuanList = { "Puan": Veri.CezaPuan, "Rutbe": "Zalim"}
        if (Veri.CezaPuan > 200) CezaPuanList = { "Puan": Veri.CezaPuan, "Rutbe": "Vicdansız"}
        if (Veri.CezaPuan > 250) CezaPuanList = { "Puan": Veri.CezaPuan, "Rutbe": "Ruhu Satılmış"}
        if (Veri.CezaPuan > 500) CezaPuanList = { "Puan": Veri.CezaPuan, "Rutbe": "Şeytan"}
      };
      return CezaPuanList;
    };
    
    client.cezaNumara = async () => {
      let VeriNumber = await Database.countDocuments().exec();
      return VeriNumber + 1;      
    };

    client.react = function(x) {
      return client.emojis.cache.get(config.React[x]);
    };
  
    client.toDate = date => {
      return moment(date).format("DD/MM/YYYY HH:mm:ss");
    };

     client.VoiceEmbed = (message, member) => {
       return {
         author: { name: member.user.username, icon_url: member.user.avatarURL({dynamic: true})},
         description: message,
         color: client.Renk[Math.floor(Math.random() * client.Renk.length)]
       };
     };
  
    Array.prototype.chunk = function(chunk_size) {
      let myArray = Array.from(this);
      let tempArray = [];
      for (let index = 0; index < myArray.length; index += chunk_size) {
        let chunk = myArray.slice(index, index + chunk_size);
        tempArray.push(chunk);
      };
      return tempArray;
    };
    

    client.getDate = (date, type) => {
        let sure;
        date = Number(date);
        if (type === "saniye") { sure = (date * 1000) }
        else if (type === "dakika") { sure = (60 * 1000) * date }
        else if (type === "saat") { sure = ((60 * 1000) * 60) * date }
        else if (type === "gün") { sure = (((60 * 1000) * 60) * 24) * date }
        else if (type === "hafta") { sure = ((((60 * 1000) * 60) * 24) * 7) * date }
        else if (type === "ay") { sure = ((((60 * 1000) * 60) * 24) * 30) * date }
        else if (type === "yıl") { sure = ((((((60 * 1000) * 60) * 24) * 30) * 12) + 5) * date };
        return sure;
    };

  client.tarih = (date) => {
    const startedAt = Date.parse(date);
    var msecs = Math.abs(new Date() - startedAt);
  
    const years = Math.floor(msecs / (1000 * 60 * 60 * 24 * 365));
    msecs -= years * 1000 * 60 * 60 * 24 * 365;
    const months = Math.floor(msecs / (1000 * 60 * 60 * 24 * 30));
    msecs -= months * 1000 * 60 * 60 * 24 * 30;
    const weeks = Math.floor(msecs / (1000 * 60 * 60 * 24 * 7));
    msecs -= weeks * 1000 * 60 * 60 * 24 * 7;
    const days = Math.floor(msecs / (1000 * 60 * 60 * 24));
    msecs -= days * 1000 * 60 * 60 * 24;
    const hours = Math.floor(msecs / (1000 * 60 * 60));
    msecs -= hours * 1000 * 60 * 60;
    const mins = Math.floor((msecs / (1000 * 60)));
    msecs -= mins * 1000 * 60;
    const secs = Math.floor(msecs / 1000);
    msecs -= secs * 1000;
  
    var string = "";
    if (years > 0) string += `${years} yıl ${months} ay`
    else if (months > 0) string += `${months} ay ${weeks > 0 ? weeks+" hafta" : ""}`
    else if (weeks > 0) string += `${weeks} hafta ${days > 0 ? days+" gün" : ""}`
    else if (days > 0) string += `${days} gün ${hours > 0 ? hours+" saat" : ""}`
    else if (hours > 0) string += `${hours} saat ${mins > 0 ? mins+" dakika" : ""}`
    else if (mins > 0) string += `${mins} dakika ${secs > 0 ? secs+" saniye" : ""}`
    else if (secs > 0) string += `${secs} saniye`
    else string += `saniyeler`;
  
    string = string.trim();
    return `\`${string} önce\``;
  };
  
    client.NoMember = (message) => {
      return {
        embed: {
          author: { name: message.guild.member(message.author).user.username, icon_url: message.author.displayAvatarURL({dynamic: true})},
          description: `${client.react("iptal")} | Argümanları düzgün yerleştiriniz, etiketlediğiniz veya belirttiğiniz ID'nin düzgün olmasına dikkat ediniz.`,
          color: client.Renk[Math.floor(Math.random() * client.Renk.length)] 
        }
      }
    }
    
    client.NoPerm = (message, roles) => {
      return {
        embed: {
          author: { name: message.guild.member(message.author).user.username, icon_url: message.author.displayAvatarURL({dynamic: true})},
          description: `${client.react("iptal")} | Bu komut için belirtilen yetki veya rol sende bulunmamakta, bu yüzden komutu kullanmana izin veremem.`,
          color: client.Renk[Math.floor(Math.random() * client.Renk.length)] 
        }
      }
    }
    
    client.NoNameAge = (message) => {
      return {
        embed: {
          author: { name: message.guild.member(message.author).user.username, icon_url: message.author.displayAvatarURL({dynamic: true})},
          description: `${client.react("iptal")} | Argümanları düzgün yerleştiriniz, belirttiğiniz isim ve yaşın düzgün olmasına dikkat ediniz.`,
          color: client.Renk[Math.floor(Math.random() * client.Renk.length)] 
        }
      }
    }
    client.embed = (message, msj, thumbnail) => {
      return {
        embed: {
          author: { name: msj.guild.member(msj.author).user.username, icon_url: msj.author.displayAvatarURL({dynamic: true})},
          description: message,
          color: client.Renk[Math.floor(Math.random() * client.Renk.length)],
          thumbnail: { url: thumbnail == true ? msj.guild.iconURL({ dynamic: true}) : null} 
        }
      }
    } 
};