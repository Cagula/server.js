const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
const port = process.env.PORT || 3000;

// Configura il client WhatsApp con autenticazione locale
const client = new Client({
    authStrategy: new LocalAuth()
});

// Middleware per il parsing del corpo delle richieste in formato JSON
app.use(express.json());

// Evento: Mostra codice QR se necessario
client.on('qr', (qr) => {
    console.log('Scansiona il seguente codice QR per connetterti a WhatsApp:');
    qrcode.generate(qr, { small: true });
});

// Evento: Client pronto
client.on('ready', () => {
    console.log('Client WhatsApp connesso e pronto per inviare messaggi.');
});

// Gestore degli errori del client
client.on('error', (error) => {
    console.error('Errore con il client WhatsApp:', error);
});

// Endpoint POST per inviare un messaggio
app.post('/send-message', async (req, res) => {
    const { targetNumber, messageText, delayInSeconds } = req.body;

    // Validazione dei parametri
    if (!targetNumber || !messageText || typeof delayInSeconds === 'undefined') {
        return res.status(400).send('Tutti i campi sono obbligatori: targetNumber, messageText e delayInSeconds.');
    }

    // Controlla che il numero di telefono sia corretto
    if (!/^\+\d+$/.test(targetNumber)) {
        return res.status(400).send('Il numero di telefono deve includere il prefisso internazionale e contenere solo cifre.');
    }

    try {
        setTimeout(() => {
            client.sendMessage(`${targetNumber}@c.us`, messageText)
                .then(() => {
                    console.log(`Messaggio inviato con successo a ${targetNumber}: ${messageText}`);
                    res.send(`Messaggio inviato con successo a ${targetNumber}!`);
                })
                .catch((error) => {
                    console.error(`Errore durante l'invio del messaggio a ${targetNumber}:`, error);
                    res.status(500).send('Errore durante l\'invio del messaggio.');
                });
        }, delayInSeconds * 1000);
    } catch (error) {
        console.error('Errore interno del server:', error);
        res.status(500).send('Errore interno del server.');
    }
});

// Avvia il server Express
app.listen(port, () => {
    console.log(`Server avviato sulla porta ${port}`);
});

// Inizializza il client WhatsApp
client.initialize();
