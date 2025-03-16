const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express(); // Crea un'applicazione Express
const port = process.env.PORT || 3000;

// Configura il client WhatsApp con autenticazione locale
const client = new Client({
    authStrategy: new LocalAuth() // Salva le credenziali in locale per sessioni persistenti
});

// Middleware per gestire il corpo delle richieste in formato JSON
app.use(express.json());

// Evento: Mostra il codice QR per la connessione
client.on('qr', (qr) => {
    console.log('Scansiona il seguente codice QR per connetterti a WhatsApp:');
    qrcode.generate(qr, { small: true });
});

// Evento: Client pronto
client.on('ready', () => {
    console.log('Client WhatsApp connesso e pronto per inviare messaggi.');
});

// Gestione degli errori del client
client.on('error', (error) => {
    console.error('Errore con il client WhatsApp:', error);
});

// Endpoint POST per inviare un messaggio
app.post('/send-message', async (req, res) => {
    const { targetNumber, messageText, delayInSeconds } = req.body;

    // Verifica che i campi siano completi
    if (!targetNumber || !messageText || typeof delayInSeconds === 'undefined') {
        return res.status(400).send('Tutti i campi sono obbligatori: targetNumber, messageText e delayInSeconds.');
    }

    try {
        // Imposta un ritardo per l'invio del messaggio
        setTimeout(() => {
            client.sendMessage(`${targetNumber}@c.us`, messageText)
                .then(() => {
                    console.log(`Messaggio inviato con successo a ${targetNumber}: ${messageText}`);
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

// Avvia il server Express
app.listen(port, () => {
    console.log(`Server avviato e in ascolto sulla porta ${port}`);
});

// Inizializza il client WhatsApp
client.initialize();
