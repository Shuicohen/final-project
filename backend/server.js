const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const userController = require('./controllers/userController');
const { verifyToken } = require('./middleware/verifyToken');
const tripRoutes = require('./routes/tripRoutes');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'https://ai-travel-planner-7o5n.onrender.com',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Use tripRoutes to handle trip-related routes
app.use('/api/trips', tripRoutes);

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

if (!PERPLEXITY_API_KEY) {
  console.error('PERPLEXITY_API_KEY is not set in the environment variables');
  process.exit(1);
}

app.post('/api/generate-trip', async (req, res) => {
  try {
    console.log('Received request:', req.body);
    const response = await axios.post('https://api.perplexity.ai/chat/completions', req.body, {
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Perplexity API response:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error in /api/generate-trip:', error);
    if (error.response) {
      console.error('Perplexity API error response:', error.response.data);
      res.status(error.response.status).json({
        error: 'Error from Perplexity API',
        details: error.response.data
      });
    } else {
      res.status(500).json({
        error: 'An error occurred while generating trip recommendations.',
        details: error.message
      });
    }
  }
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'An unexpected error occurred' });
});

app.post('/api/refresh-token', (req, res) => {
  console.log('Received cookies:', req.cookies);

  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token not found' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );

    res.cookie('token', accessToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    res.json({ accessToken });
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(403).json({ message: 'Invalid refresh token' });
  }
});

// Authentication routes
app.post('/api/register', userController.registerUser);
app.post('/api/login', userController.loginUser);
app.post('/api/logout', userController.logoutUser);
app.get('/api/auth', verifyToken, userController.verifyAuth);
app.get('/api/auth/verify', verifyToken, userController.verifyAuth);
app.get('/api/users', verifyToken, userController.getUsers);

// Verify authentication route
app.get('/auth/verify', (req, res) => {
  console.log('Request user object:', req.user); // Debugging line
  if (req.user) {  // Assuming `req.user` is set correctly after authentication
    res.json({ user: req.user });
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
