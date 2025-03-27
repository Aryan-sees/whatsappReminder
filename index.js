const express = require('express');
const bodyParser = require('body-parser');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
const port = 3000;

app.use(bodyParser.json());

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

// Generate QR in terminal
client.on('qr', (qr) => {
  console.log('📲 Scan this QR in your WhatsApp app:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ WhatsApp Client is ready!');
});

client.initialize();

// Route to send message to a specific group
app.post('/send', async (req, res) => {
  const message = req.body.message;
  const groupName = 'ReminderWA';

  try {
    const chats = await client.getChats();
    const group = chats.find(chat => chat.isGroup && chat.name === groupName);

    if (!group) {
      return res.status(404).send('Group not found');
    }

    await client.sendMessage(group.id._serialized, message);
    res.send('✅ Message sent to group!');
  } catch (error) {
    console.error(error);
    res.status(500).send('❌ Error sending message');
  }
});

// Root endpoint (optional)
app.get('/', (req, res) => {
  res.send('🟢 WhatsApp Group Bot is live!');
});

app.listen(port, () => {
  console.log(`🚀 Webhook listening on port ${port}`);
});
