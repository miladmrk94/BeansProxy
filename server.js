require("dotenv").config();
const express = require('express');
const fetch = require('node-fetch'); // برای ارسال درخواست به API گوگل
const app = express();
const port = process.env.PORT || 3000;

// تنظیمات برای دریافت داده‌ها به فرمت JSON
app.use(express.json());

app.post('/api', async (req, res) => {
  const { word } = req.body; // دریافت کلمه از درخواست
  
  try {
    const API_KEY = process.env.API_KEY;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
       {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `Explain the word: ${word}` }
            ]
          }
        ]
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching from Google API:', error);
    res.status(500).json({ error: 'Error fetching data' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
