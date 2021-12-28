class Cezalar {
  constructor() {
    (this.name = "cezalar", this.alias = ["sicil", "ceza", "sorgu", "cezasorgu", "cezapuanı", "cezapuan", "cpuan", "aktifcezalar", "acezalar", "aktif-cezalar"])
  };
  
  async operate({ client, message, args, author, config }, fetch = require("node-fetch"), { MessageEmbed } = require("discord.js"), Database = require("../Models/Restriction")) {
    if ((!author.roles.cache.some(r => config.Perms.Commander.includes(r.id))) && (!author.permissions.has("ADMINISTRATOR"))) return client.tepki(message, "iptal", client.NoPerm(message));
    let split = message.content.toLowerCase().substring(message.prefix.length).split(" ");
    let target;
    if (["cezapuanı", "cezapuan", "cpuan"].includes(split[0])) {
      target = (message.mentions.users.first()) || await (await fetch(`https://discord.com/api/users/${args[0]}`, {method:'GET', headers: {'Authorization': 'Bot ' + client.token}})).json();
      if ((!target) || (Object.keys(target).length <= 2)) return client.tepki(message, "iptal", client.NoMember(message)); 
      var CezaPuanCheck = await client.cezaPuanCheck(target);
      client.message(`${message.guild.members.cache.get(target.id) ? message.guild.members.cache.get(target.id) : `${target.username}#${target.discriminator}`}: ceza puanı **${CezaPuanCheck.Puan}** ve ceza rütbesi **${CezaPuanCheck.Rutbe}** şeklindedir.`, message.channel.id);
      } else if (["aktifcezalar", "aktif-cezalar", "acezalar"].includes(split[0])) {
        target = (message.mentions.users.first()) || await (await fetch(`https://discord.com/api/users/${args[0]}`, {method:'GET', headers: {'Authorization': 'Bot ' + client.token}})).json();
        if ((!target) || (Object.keys(target).length <= 2)) return client.tepki(message, "iptal", client.NoMember(message));
        let Data = await Database.find({ userID: target.id }).exec();
        Database.find({ userID: target.id, Activity: true  }).exec((err, res) => {
          let üşeniyom = [];
          let mute = res.filter(x => ["MUTE", "PERMAMUTE"].includes(x.Type) && !x.Type.includes("VMUTE")).sort((x,y) => y.DateNow - x.DateNow)[0];
          let vmute = res.filter(x => ["VMUTE", "PERMAVMUTE"].includes(x.Type)).sort((x,y) => y.DateNow - x.DateNow)[0];
          let jail = res.filter(x => x.Type == "JAIL").sort((x,y) => y.DateNow - x.DateNow)[0]; 
          let ban = res.filter(x => x.Type == "BAN").sort((x,y) => y.DateNow - x.DateNow)[0];
          if ((!mute) && (!vmute) && (!jail) && (!ban)) return client.tepki(message, "tik", client.embed(`${message.guild.members.cache.get(target.id)} üyesi geçmişte **${Data.length}** ceza almış. En son aldığı ceza tipi **${Data.reverse()[0] ? `${Data.reverse()[0].Type.replace("PERMA", "")}'dır.` : "yoktur."}**\n\n**Şu anda hiç bir aktif cezalandırılması bulunmuyor.**`, message));
          if (mute) üşeniyom.push(mute);
          if (vmute) üşeniyom.push(vmute);
          if (jail) üşeniyom.push(jail);
          if (ban) üşeniyom.push(ban);
          return client.message(client.embed(`${message.guild.members.cache.get(target.id) ? message.guild.members.cache.get(target.id) : `${target.username}#${target.discriminator}`} üyesi geçmişte **${Data.length || "0"}** ceza almış. En son aldığı ceza tipi **${Data.reverse()[0].Type.replace("PERMA", "")}**'dır.\n\n${üşeniyom.map((value,index) => ` **__${value.Type.replace("PERMA", "")}:__** \`${value.Reason}\` sebebiyle ${message.guild.members.cache.has(value.Author) ? message.guild.member(value.Author) : value.Author} tarafından atılan ceza. **[${value.FinishDate ? client.tarih(value.FinishDate).replace("önce", "sonra") : "\`PERMA\`"}]**`).join("\n\n")}`, message), message.channel.id);
        });
      } else if (["ceza", "sorgu", "cezasorgu"].includes(split[0])) {
      target = (message.mentions.users.first()) || await (await fetch(`https://discord.com/api/users/${args[0]}`, {method:'GET', headers: {'Authorization': 'Bot ' + client.token}})).json();
      if ((!target) || (Object.keys(target).length <= 2)) {
      let Ceza = (args[0] && Number(args[0]) ? Number(args[0]) : false);
      let Data = await Database.findOne({ CezaID: Ceza }).exec();
      if ((!Ceza) || (!Data)) return client.tepki(message, "iptal", client.embed(`${client.react("iptal")} | Belirttiğin ceza numarasına göre veritabanında bir ceza bulunamadı veya bir numara belirtmedin.`, message));
      author = message.guild.members.cache.get(Data.Author);
      target = await (await fetch(`https://discord.com/api/users/${Data.userID}`, {method:'GET', headers: {'Authorization': 'Bot ' + client.token}})).json();
      return client.message(client.embed(`__**№:**__ \`${Data.CezaID}\`\n\n${message.guild.members.cache.get(target.id) ? message.guild.members.cache.get(target.id) : `${target.username}#${target.discriminator}`} üyesinin **${Data.Type.replace("PERMA", "")}** cezası ${Data.Activity == true ? `hala devam ediyor` : `bitmiştir`}. Bu ceza \`${author.displayName || Data.Author}\` tarafından uygulanmış.\n\n**\`‧\` ** **Cezayı Uygulayan:** ${author} (\`${author.displayName} - ${author.id}\`)\n**\`‧\` ** **Cezalandırılan:** <@${target.id}> (\`${message.guild.members.cache.get(target.id) ? message.guild.members.cache.get(target.id).displayName : `${target.username}#${target.discriminator}`} - ${target.id}\`)\n\n**\`‧\` ** **Başlangıç Tarihi:** ${client.toDate(Data.DateNow)}\n**\`‧\` ** **Bitiş Tarihi:** ${Data.FinishDate !== null ? `${client.toDate(Data.FinishDate)}` : "Bulunamadı."}\n**\`‧\` ** **Ceza Sebebi:** \`${Data.Reason}\``, message), message.channel.id);
    } else if ((target) || (Object.keys(target).length > 2)) {
     let Data = await Database.find({ userID: target.id }).exec();
     let Ceza = (args[1] && Number(args[1]) ? Number(args[1]) : false);
      if (!Ceza || !Data[Ceza - 1]) return client.tepki(message, "iptal", client.embed(`${client.react("iptal")} | Belirttiğin ceza numarasına göre veritabanında bir ceza bulunamadı veya bir numara belirtmedin.`, message));
      Data = Data[Ceza - 1];
      author = message.guild.members.cache.get(Data.Author);
      return client.message(client.embed(`__**№:**__ \`${Data.CezaID}\`\n\n${message.guild.members.cache.get(target.id) ? message.guild.members.cache.get(target.id) : `${target.username}#${target.discriminator}`} üyesinin **${Data.Type.replace("PERMA", "")}** cezası ${Data.Activity == true ? `hala devam ediyor` : `bitmiştir`}. Bu ceza \`${author.displayName || Data.Author}\` tarafından uygulanmış.\n\n**\`‧\` ** **Cezayı Uygulayan:** ${author} (\`${author.displayName} - ${author.id}\`)\n**\`‧\` ** **Cezalandırılan:** <@${target.id}> (\`${message.guild.members.cache.get(target.id) ? message.guild.members.cache.get(target.id).displayName : `${target.username}#${target.discriminator}`} - ${target.id}\`)\n\n**\`‧\` ** **Başlangıç Tarihi:** ${client.toDate(Data.DateNow)}\n**\`‧\` ** **Bitiş Tarihi:** ${Data.FinishDate !== null ? `${client.toDate(Data.FinishDate)}` : "Bulunamadı."}\n**\`‧\` ** **Ceza Sebebi:** \`${Data.Reason}\``, message), message.channel.id);
    };
    } else {
     target = (message.mentions.users.first()) || await (await fetch(`https://discord.com/api/users/${args[0]}`, {method:'GET', headers: {'Authorization': 'Bot ' + client.token}})).json();
      if ((!target) || (Object.keys(target).length <= 2)) return client.tepki(message, "iptal", client.NoMember(message)); 
     let Data = await Database.find({ userID: target.id }).exec();
      if ((!Data) || (!Data.length) || (Data.length < 1)) return client.tepki(message, "iptal", client.embed(`${client.react("iptal")} | Bu kullanıcının hiç bir ceza kaydı bulunamadı.`, message));
     var CezaPuan = await client.cezaPuanCheck(target);
     let currentPage = 1;
     const pageLimit = 10;
     let History = Data.map((value, index) => {
     let Replace = value.Type.replace("PERMA", ""), Has = message.guild.members.cache.get(value.Author) ? message.guild.members.cache.get(value.Author).user.username : value.Author;
       return `**${index + 1}. (${Replace}  #${value.CezaID})** [${value.Activity == true ? `${client.react("tik")} \`| ${Has}\``: `\`${client.toDate(value.DateNow)} ${Has}\``}] \`${value.Reason}\``
     });
     const pages = History.chunk(pageLimit);
     const filter = (reaction, user) => ["◀","▶", "❌"].includes(reaction.emoji.name || reaction.emoji.id) && user.id == message.author.id; 
     const mesaj = await message.channel.send(client.embed(`${message.guild.members.cache.get(target.id) ? message.guild.members.cache.get(target.id) : `${target.username}#${target.discriminator}`} üyesinin toplamda **${Data.length}** cezalandırılması var. En son aldığı ceza tipi **${Data[0].Type.replace("PERMA", "")}**'dir.\n\n**Ceza Puanı:** \`${CezaPuan.Puan}\`\nCeza Rütbesi: ${CezaPuan.Rutbe}\n\n${History.join("\n\n")}`, message))
     const collector = mesaj.createReactionCollector((filter), { time: 20000 })
     if (Data.length > pageLimit) {
        await mesaj.react("◀");
        await mesaj.react("❌");
        await mesaj.react("▶");
     collector.on("collect", async (reaction) => {
        let name = reaction.emoji.name;
        if (name == "◀") {
          console.log("annen")
          await reaction.users.remove(message.author.id).catch(err => {});
            if (currentPage === 1) return;
            currentPage--;
              if (mesaj) mesaj.edit(client.embed(`${message.guild.members.cache.get(target.id) ? message.guild.members.cache.get(target.id) : `${target.username}#${target.discriminator}`} üyesinin toplamda **${Data.length}** cezalandırılması var. En son aldığı ceza tipi **${Data[0].Type.replace("PERMA", "")}**'dir.\n\n**Ceza Puanı:** \`${CezaPuan.Puan}\`\nCeza Rütbesi: ${CezaPuan.Rutbe}\n\n${History.slice(currentPage === 1 ? 0 : Number((currentPage * pageLimit) - pageLimit), Number(currentPage * pageLimit)).join("\n\n")}`, message));
        } else if (name == "❌") {
          await collector.stop();
            if (message) message.delete();
              if (mesaj) return mesaj.delete();
        } else if (name == "▶") {
         await reaction.users.remove(message.author.id).catch(err => {});
         if (currentPage === pages.length) return;
         currentPage++;
           if (mesaj) mesaj.edit(client.embed(`${message.guild.members.cache.get(target.id) ? message.guild.members.cache.get(target.id) : `${target.username}#${target.discriminator}`} üyesinin toplamda **${Data.length}** cezalandırılması var. En son aldığı ceza tipi **${Data[0].Type.replace("PERMA", "")}**'dir.\n\n**Ceza Puanı:** \`${CezaPuan.Puan}\`\nCeza Rütbesi: ${CezaPuan.Rutbe}\n\n${History.slice(currentPage === 1 ? 0 : Number((currentPage * pageLimit) - pageLimit), Number(currentPage * pageLimit)).join("\n\n")}`, message));
        };
       });
      collector.on("end", (reaction) => {});
     };  
   };
  };
}

module.exports = Cezalar;