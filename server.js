const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express(); // Dichiara l'applicazione Express
const port = process.env.PORT || 3000;

const client = new Client({
    authStrategy: new LocalAuth()
});

app.use(express.json());

client.on('qr', (qr) => {
    console.log('Scansiona questo codice QR per connetterti a WhatsApp:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Connessione a WhatsApp avvenuta con successo!');
});

app.post('/send-message', async (req, res) => {
    const { targetNumber, messageText, delayInSeconds } = req.body;

    if (!targetNumber || !messageText || !delayInSeconds) {
        return res.status(400).send('Tutti i campi sono obbligatori: targetNumber, messageText e delayInSeconds!');
    }

    try {
        setTimeout(async () => {
            await client.sendMessage(`${targetNumber}@c.us`, messageText);
            console.log(`Messaggio inviato a ${targetNumber}: ${messageText}`);
        }, delayInSeconds * 1000);

        res.send(`Il messaggio per ${targetNumber} verrà inviato dopo ${delayInSeconds} secondi.`);
    } catch (error) {
        console.error('Errore nell\'invio del messaggio:', error);
        res.status(500).send('Errore durante l\'invio del messaggio.');
    }
});

app.listen(port, () => {
    console.log(`Server in esecuzione sulla porta ${port}`);
});

client.initialize();
