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

// Aggiungi l'evento per mostrare il codice QR nel terminale
client.on('qr', (qr) => {
    console.log('Scansiona il seguente codice QR per connetterti a WhatsApp:');
    qrcode.generate(qr, { small: true });
});

// Evento: connessione completata
client.on('ready', () => {
    console.log('Il client è connesso a WhatsApp!');
});

// Endpoint POST per inviare un messaggio
app.post('/send-message', async (req, res) => {
    const { targetNumber, messageText, delayInSeconds } = req.body;

    // Controlla che tutti i campi siano presenti
    if (!targetNumber || !messageText || !delayInSeconds) {
        return res.status(400).send('Tutti i campi sono obbligatori: targetNumber, messageText e delayInSeconds!');
    }

    try {
        // Imposta un ritardo prima di inviare il messaggio
        setTimeout(async () => {
            await client.sendMessage(`${targetNumber}@c.us`, messageText); // Formatta il numero per WhatsApp
            console.log(`Messaggio inviato a ${targetNumber}: ${messageText}`);
        }, delayInSeconds * 1000); // Converti i secondi in millisecondi

        res.send(`Il messaggio sarà inviato a ${targetNumber} dopo ${delayInSeconds} secondi.`);
    } catch (error) {
        console.error('Errore durante l\'invio del messaggio:', error);
        res.status(500).send('Errore durante l\'invio del messaggio.');
    }
});

// Avvio del server Express
app.listen(port, () => {
    console.log(`Server attivo sulla porta ${port}`);
});

// Inizializza il client di WhatsApp
client.initialize();
