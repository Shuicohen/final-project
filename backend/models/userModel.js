// backend/models/userModel.js
const { db } = require('../config/db');
const bcrypt = require('bcrypt');

module.exports = {
  createUser: async (username, email, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [user] = await db('users').insert({
      username,
      email,
      password: hashedPassword
    }).returning(['id', 'email', 'username']);
    return user;
  },

  getUserByEmailOrUsername: async (emailOrUsername) => {
    const user = await db('users')
      .where({ email: emailOrUsername })
      .orWhere({ username: emailOrUsername })
      .first();
    return user;
  },

  getUsers: async () => {
    const users = await db('users').select('id', 'email', 'username');
    return users;
  }
};