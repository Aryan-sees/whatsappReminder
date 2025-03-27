const express = require('express');
const bodyParser = require('body-parser');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode'); // using qrcode instead of qrcode-terminal

const app = express();
const port = 3000;

app.use(bodyParser.json());

let qrImageUrl = ''; // Store QR data URL

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('qr', async (qr) => {
  console.log('📲 QR received, generating image URL...');
  qrImageUrl = await qrcode.toDataURL(qr);
});

client.on('ready', () => {
  console.log('✅ WhatsApp client is ready!');
});

client.initialize();

// Endpoint to get QR Code image
app.get('/qr', (req, res) => {
  if (!qrImageUrl) {
    return res.status(404).send('QR not generated yet.');
  }

  const html = `
    <html>
      <body style="display:flex;align-items:center;justify-content:center;height:100vh;">
        <img src="${qrImageUrl}" />
      </body>
    </html>
  `;
  res.send(html);
});

// Group message endpoint
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

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
