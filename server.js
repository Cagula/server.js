const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express(); // Inizializza l'app Express
const port = process.env.PORT || 3000;

// Configurazione del client WhatsApp con autenticazione locale
const client = new Client({
    authStrategy: new LocalAuth() // Salva l'autenticazione nel file system
});

// Middleware per il parsing del corpo delle richieste JSON
app.use(express.json());

// Gestione del codice QR per la connessione iniziale
client.on('qr', (qr) => {
    console.log('Scansiona il seguente codice QR per connetterti a WhatsApp:');
    qrcode.generate(qr, { small: true });
});

// Evento: Connessione completata
client.on('ready', () => {
    console.log('Client WhatsApp pronto per inviare messaggi.');
});

// Evento: Gestione di errori generali nel client
client.on('error', (error) => {
    console.error('Errore con il client WhatsApp:', error);
});

// Endpoint POST per inviare un messaggio
app.post('/send-message', async (req, res) => {
    const { targetNumber, messageText, delayInSeconds } = req.body;

    // Validazione dei parametri della richiesta
    if (!targetNumber || !messageText || typeof delayInSeconds === 'undefined') {
        return res.status(400).send('Tutti i campi sono obbligatori: targetNumber, messageText e delayInSeconds.');
    }

    try {
        // Imposta un ritardo prima di inviare il messaggio
        setTimeout(() => {
            client.sendMessage(`${targetNumber}@c.us`, messageText)
                .then(() => {
                    console.log(`Messaggio inviato correttamente a ${targetNumber}: ${messageText}`);
                })
                .catch((error) => {
                    console.error(`Errore durante l'invio del messaggio a ${targetNumber}:`, error);
                });
        }, delayInSeconds * 1000);

        // Risposta immediata al client
        res.send(`Il messaggio sarà inviato a ${targetNumber} dopo ${delayInSeconds} secondi.`);
    } catch (error) {
        console.error('Errore interno del server:', error);
        res.status(500).send('Errore interno del server.');
    }
});

// Avvia il server Express
app.listen(port, () => {
