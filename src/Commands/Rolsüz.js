class Rolsuz {
  constructor() {
    (this.name = "rolsüz", this.alias = ["rolsuz", "rölsüz"]) 
  };
  
  async operate ({ client, message, args, config, author }) {
    if (!author.permissions.has("ADMINISTRATOR")) return client.tepki(message, "iptal", client.NoPerm(message));
    const type = args[0];
    let RolsuzMembers = message.guild.members.cache.filter(x => (x.roles.cache.size) == 1).array();
    if (!type) return client.message(client.embed(`Sunucuda rolü olmayan (\`${RolsuzMembers.length}\`) kişi bulunuyor. Bu kişilere kayıtsız rolü vermek için __[ rolsüz ver ]__ komutunu kullanın.\n────────────\n${RolsuzMembers.length < 30 ? RolsuzMembers.join(",") : `Sunucuda 30 kişiden fazla rolsüz olduğu için sadece 30 kişiyi gösterebilirim.\n${RolsuzMembers.slice(0, 30).join(",")}`}`, message), message.channel.id, 7500);
    else if (["ver", "dağıt"].includes(type)) {
      RolsuzMembers.forEach((member, index) => {
        setTimeout(() => {
          member.roles.add(config.Roles.Unregister).catch();
        }, index * 750)
      });
      return client.tepki(message, "tik");
    };
  }
  }

module.exports = Rolsuz;