// backend/controllers/userController.js
const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = {
  registerUser: async (req, res) => {
    const { username, email, password } = req.body;
    try {
      const user = await userModel.createUser(username, email, password);
      res.status(201).json({
        message: 'User registered successfully',
        user
      });
    } catch (error) {
      console.error('Registration error:', error);
      if (error.code === '23505') {
        return res.status(400).json({ message: 'Email or username already exists' });
      }
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  },

  loginUser: async (req, res) => {
    const { password, emailOrUsername } = req.body;
    try {
      const user = await userModel.getUserByEmailOrUsername(emailOrUsername);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const passwordMatch = await bcrypt.compare(password + "", user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const accessToken = jwt.sign(
        { userid: user.id, email: user.email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
      );
      const refreshToken = jwt.sign(
        { userid: user.id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
      );

      res.cookie('token', accessToken, {
        maxAge: 15 * 60 * 1000,
        httpOnly: true,
        sameSite: 'strict',
      });

      res.cookie('refreshToken', refreshToken, { 
        maxAge: 7 * 24 * 60 * 60 * 1000, 
        httpOnly: true,
        sameSite: 'strict',
      });

      res.json({
        message: 'Login successful',
        user: { userid: user.id, email: user.email, username: user.username },
        token: accessToken
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  getUsers: async (req, res) => {
    try {
      const users = await userModel.getUsers();
      res.json(users);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  logoutUser: (req, res) => {
    console.log(req.cookies);
    res.clearCookie('token');
    delete req.cookies.token;
    delete req.headers['x-access-token'];
    res.sendStatus(200);
  },

  verifyAuth: (req, res) => {
    if (req.userinfo) { // Check that req.userinfo is defined
      const { userid, email, username } = req.userinfo;
      res.json({ user: { userid, email, username } });
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
  },
};