const { Client, MessageEmbed } = require("discord.js");
const fs = require("fs");
const Config = require("../config.json");
const mongoose = require("mongoose");

class Bot extends Client {
    constructor(options) {
        super (options);
        this.config = Config;
        this.cmd = new Map();
        this.aliases = new Map();
        this.clean = (text) => {
          if (typeof text != "string") text = require("util").inspect(text, { depth: 0 });
          text = text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203));
          return text;
        };
        this.AFKMembers2 = new Set();
        this.ReklamMembers = new Set();
    };

    commandHandler () {
    fs.readdir("./src/Commands/", (err, files, x = []) => {
    if (err) return console.log("Err:" + err);
    files.filter(f => f.endsWith(".js")).forEach(file => {
    let Prop = require(`../Commands/${file}`);
    let xClass = new Prop();
      if ((xClass.event) && typeof xClass.event == "function") xClass.event(this);
      this.cmd.set(xClass.name, xClass.operate);
      xClass.alias.forEach(alias => {
       this.aliases.set(alias, xClass.operate);
      });
      x.push(xClass.name);
    });
    console.log(`[${x.join(",")}] commands loaded (${files.length}).`)
    });
  };

    eventHandler () {
    fs.readdir("./src/Events/", (err, files, events = []) => {
    if (err) return console.log("Err:" + err);
    files.filter(f => f.endsWith(".js")).forEach(file => {
    let prop = require(`../Events/${file}`);
      this.on(prop.event.name, prop.event.eventOn);
      events.push(file.split(".")[0]);
    });
    console.log(`[${events.join(",")}] events loaded (${files.length}).`);
    });
  };

    start () {
    process.client = (global.client = this); 
    this.login(Config.Import.Moderation.Token).then(() => console.log(`${this.user.tag} - ${this.user.id} | Client active.`));
    this.commandHandler();
    this.eventHandler();
    require("./Functions.js")(this, require("fs"), Config);
    if (Config.Import.MongooseURL) mongoose.connect(Config.Import.MongooseURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  };
};

module.exports = Bot;