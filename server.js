const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
const port = process.env.PORT || 3000;

const client = new Client({
    authStrategy: new LocalAuth()
});

app.use(express.json());

client.on('qr', (qr) => {
    console.log('Scanați acest cod QR pentru a vă conecta la WhatsApp:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Conexiune WhatsApp reușită!');
});

app.post('/send-message', async (req, res) => {
    const { targetNumber, messageText, delayInSeconds } = req.body;

    if (!targetNumber || !messageText || !delayInSeconds) {
        return res.status(400).send('Toate câmpurile sunt obligatorii: targetNumber, messageText și delayInSeconds!');
    }

    try {
        setTimeout(async () => {
            await client.sendMessage(`${targetNumber}@c.us`, messageText);
            console.log(`Mesaj trimis către ${targetNumber}: ${messageText}`);
        }, delayInSeconds * 1000);

        res.send(`Mesajul către ${targetNumber} va fi trimis după ${delayInSeconds} secunde.`);
    } catch (error) {
        console.error('Eroare la trimiterea mesajului:', error);
        res.status(500).send('A apărut o eroare la trimiterea mesajului.');
    }
});

app.listen(port, () => {
    console.log(`Serverul rulează pe portul ${port}`);
});

client.initialize();
