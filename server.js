require("dotenv").config();

//----------------------
const express = require("express");
const fetch = require("node-fetch");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post("/api", async (req, res) => {
  const { word } = req.body;

  try {
    const API_KEY = process.env.API_KEY;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
                You are an advanced English language assistant specializing in vocabulary explanation and linguistic analysis. Your task is to provide the following in JSON format:
                A simple explanation of the meaning of the word "${word}" in up to 3 sentences.
                Its phonetic transcription in International Phonetic Alphabet (IPA).
                Up to 5 synonyms.
                Up to 5 antonyms.
                Up to 3 short and simple example sentences using the word that reflect its most common usage.
                `,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching from Google API:", error);
    res.status(500).json({ error: "Error fetching data" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
