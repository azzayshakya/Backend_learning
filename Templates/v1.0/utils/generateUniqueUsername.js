const User = require("../models/user.model");

async function generateUniqueUsername() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  let username;
  let exists = true;

  while (exists) {
    let value = "USR";

    for (let i = 0; i < 7; i++) {
      value += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    username = value;

    exists = await User.exists({ username });
  }

  return username;
}

module.exports = generateUniqueUsername;
