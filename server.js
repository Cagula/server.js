const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express(); // Dichiara l'applicazione Express
const port = process.env.PORT || 3000;

// Configurazione del client WhatsApp
const client = new Client({
    authStrategy: new LocalAuth() // Salva automaticamente l'autenticazione locale
});

// Middleware per gestire il parsing JSON
app.use(express.json());

// Evento: Mostra il codice QR per la connessione
client.on('qr', (qr) => {
    console.log('Scansiona il seguente codice QR per connetterti a WhatsApp:');
    qrcode.generate(qr, { small: true });
});

// Evento: connessione completata
client.on('ready', () => {
    console.log('Il client è connesso a WhatsApp!');
});

// Gestione errori del client
client.on('error', (error) => {
    console.error('Errore con WhatsApp Client:', error);
});

// Endpoint POST per inviare un messaggio
app.post('/send-message', async (req, res) => {
    const { targetNumber, messageText, delayInSeconds } = req.body;

    if (!targetNumber || !messageText || !delayInSeconds) {
        return res.status(400).send('Tutti i campi sono obbligatori: targetNumber, messageText e delayInSeconds!');
    }

    try {
        setTimeout(() => {
            client.sendMessage(`${targetNumber}@c.us`, messageText)
                .then(() => {
                    console.log(`Messaggio inviato correttamente a ${targetNumber}: ${messageText}`);
                })
                .catch((error) => {
                    console.error(`Errore durante l'invio del messaggio a ${targetNumber}:`, error);
                });
        }, delayInSeconds * 1000);

        res.send(`Il messaggio sarà inviato a ${targetNumber} dopo ${delayInSeconds} secondi.`);
    } catch (error) {
        console.error('Errore interno del server:', error);
        res.status(500).send('Errore interno del server.');
    }
});

// Avvio del server
app.listen(port, () => {
    console.log(`Server attivo sulla porta ${port}`);
});

// Inizializza il client WhatsApp
client.initialize();
