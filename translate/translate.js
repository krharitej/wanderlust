const express = require('express');
const multer = require('multer');
const speech = require('@google-cloud/speech');
const { Translate } = require('@google-cloud/translate').v2;
const textToSpeech = require('@google-cloud/text-to-speech');
const path = require('path');

const client = new speech.SpeechClient();
const translate = new Translate();
const ttsClient = new textToSpeech.TextToSpeechClient();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const cors = require('cors');
app.use(cors());

process.env.GOOGLE_APPLICATION_CREDENTIALS = 'A:\\Wandelust\\wanderlust\\tribal-primacy-440508-r6-3956629c543e.json';


// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// Endpoint to serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'translate.html'));
});

// Function to translate text
async function translateText(text, targetLanguage) {
    const [translation] = await translate.translate(text, targetLanguage);
    return translation;
}

// Function to convert text to speech
async function textToSpeechConversion(text, languageCode) {
    const request = {
        input: { text: text },
        voice: { languageCode: languageCode, ssmlGender: 'NEUTRAL' },
        audioConfig: { audioEncoding: 'MP3' },
    };
    const [response] = await ttsClient.synthesizeSpeech(request);
    return response.audioContent;
}

// Endpoint for voice-to-voice translation
app.post('/translate', upload.single('audio'), async (req, res) => {
    try {
        const audioBytes = req.file.buffer.toString('base64');
        const audio = { content: audioBytes };

        const config = {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            languageCode: 'en-US', // Change this to the language code of the input audio
        };

        const request = { audio: audio, config: config };

        // Recognize the speech
        const [response] = await client.recognize(request);
        const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join(' ');

        // Translate the text
        const targetLanguage = 'fr'; // Set the target language code
        const translatedText = await translateText(transcription, targetLanguage);

        // Convert translated text to speech
        const audioContent = await textToSpeechConversion(translatedText, targetLanguage);

        // Send the audio content back
        res.set('Content-Type', 'audio/mp3');
        res.send(audioContent);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error during translation process');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
