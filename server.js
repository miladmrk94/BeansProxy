require('dotenv').config();
const express = require('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Basic security and middleware setup
app.use(express.json());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Configure axios instance
const googleAPI = axios.create({
  baseURL: 'https://generativelanguage.googleapis.com/v1beta',
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.response) {
    // Google API error response
    return res.status(err.response.status).json({
      error: err.response.data.error || 'API Error',
      message: err.response.data.message || 'An error occurred while processing your request'
    });
  }
  
  if (err.code === 'ECONNABORTED') {
    return res.status(408).json({
      error: 'Request Timeout',
      message: 'The request took too long to complete'
    });
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred'
  });
};

// Validate API key middleware
const validateApiKey = (req, res, next) => {
  const API_KEY = process.env.API_KEY;
  if (!API_KEY) {
    return res.status(500).json({
      error: 'Configuration Error',
      message: 'API key is not configured'
    });
  }
  next();
};

// Main API endpoint
app.post('/api', validateApiKey, async (req, res, next) => {
  try {
    const { word } = req.body;
    
    if (!word || typeof word !== 'string') {
      return res.status(400).json({
        error: 'Invalid Request',
        message: 'Please provide a valid word in the request body'
      });
    }

    const response = await googleAPI.post(
      `/models/gemini-1.5-flash:generateContent?key=${process.env.API_KEY}`,
      {
        contents: [{
          parts: [{
            text: `
              You are an advanced English language assistant specializing in vocabulary explanation and linguistic analysis. Your task is to provide the following in JSON format:
              A simple explanation of the meaning of the word "${word}" in up to 3 sentences.
              Its phonetic transcription in International Phonetic Alphabet (IPA).
              Up to 5 synonyms.
              Up to 5 antonyms.
              Up to 3 short and simple example sentences using the word that reflect its most common usage.
            `
          }]
        }]
      }
    );

    res.json(response.data);
  } catch (error) {
    next(error); // Pass error to error handler
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Apply error handler
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});