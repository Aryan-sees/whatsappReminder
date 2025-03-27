const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Setup WhatsApp client with required Chrome flags
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true
  }
});

app.use(bodyParser.json());

// QR Scan Log
client.on('qr', (qr) => {
  console.log('\n📲 Scan this QR in your WhatsApp app:');
  console.log(qr);
});

// Ready Log
client.on('ready', () => {
  console.log('✅ WhatsApp client is ready!');
});

// Webhook: POST /send-group
app.post('/send-group', async (req, res) => {
  const message = req.body.message;

  if (!message) {
    return res.status(400).send('❌ No message provided');
  }

  try {
    const chats = await client.getChats();
    const group = chats.find(chat => chat.isGroup && chat.name === 'ReminderWA');

    if (!group) {
      return res.status(404).send('❌ Group "ReminderWA" not found');
    }

    await group.sendMessage(message);
    console.log(`📤 Message sent to group ReminderWA:`, message);
    res.send('✅ Message sent!');
  } catch (err) {
    console.error('❌ Error sending to group:', err);
    res.status(500).send('❌ Internal error');
  }
});

// Start WhatsApp and webhook server
client.initialize();
app.listen(PORT, () => {
  console.log(`🚀 Webhook listening on port ${PORT}`);
});
