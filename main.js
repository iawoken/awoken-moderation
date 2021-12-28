const Bot = require("./src/Functions/Client.js"); // awoken was here :D
const client = new Bot({ disableMentions: "everyone", ignoreDirect: true, ignoreRoles: true, fetchAllMembers: true }).start();