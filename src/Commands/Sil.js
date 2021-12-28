class Sil {
  constructor() {
    (this.name = "sil", this.alias = ["delete", "temizle"]);
  };
  
  async operate ({ client, message, args, config, member, author }) {
    if (!author.permissions.has("MANAGE_MESSAGES")) return client.tepki(message, "iptal", client.NoPerm(message));
    if ((!args[0]) || isNaN(args[0])) return;
    await message.delete();
    let Sayi = Number(args[0]);
    let SilinenMesaj = 0;
    if (Sayi <= 100) {
    await message.channel.bulkDelete(Sayi).then(async x => await client.message(`\`\`\`${Sayi} adet mesaj silinmiştir.\`\`\``, message.channel.id, 3700));
    return;
  }
    for (let Mesaj = 0; Mesaj < Math.floor(Sayi/100); Mesaj++) {
    await message.channel.bulkDelete(100).then(xd => (SilinenMesaj += xd.size));
    Sayi = Sayi - 100;
  }
   if (Sayi > 0) 
      await message.channel.bulkDelete(Sayi).then(x => (SilinenMesaj += x.size));
      await client.message(`\`\`\`${SilinenMesaj}\` adet mesaj silinmiştir.\`\`\``, message.channel.id, 5500);
   
  };
};

module.exports = Sil;
