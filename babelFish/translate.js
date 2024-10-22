require("dotenv").config();
const axios = require('axios');
const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;
const apiKey = process.env.API_KEY;
const languages = ['es', 'fr', 'de', 'ja'];

app.use(express.json());
app.use(cors());



app.post('/translate', async (req, res) => {
    const text = req.body.text;
    const results = {};

    for (const lang of languages) {
        try {
            const response = await axios.post(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
                q: text,
                target: lang,
            });
            const translation = response.data.data.translations[0].translatedText;
            results[lang] = translation;
        } catch (error) {
            console.error(`Error translating to ${lang}:`, error.response.data);
            return res.status(500).json({ error: `Error translating to ${lang}` });
        }
    }

    res.json(results);
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
