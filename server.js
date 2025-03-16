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

        res.send(`Il messaggio sarà inviato a ${targetNumber} dopo ${delayInSeconds} secondi.`);
    } catch (error) {
        console.error('Errore nell\'invio del messaggio:', error);
        res.status(500).send('Errore durante l\'invio del messaggio.');
    }
});
