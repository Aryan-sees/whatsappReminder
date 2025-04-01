const express = require('express');
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const client = new Client({
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('qr', (qr) => {
  const qrLink = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qr)}&size=300x300`;
  console.log('📲 Scan this QR to authenticate:');
  console.log(qrLink);
});

client.on('ready', () => {
  console.log('✅ WhatsApp client is ready!');
});

client.initialize();

// ✅ POST /send { "number": "91XXXXXXXXXX", "message": "Hi there!" }
app.post('/send', async (req, res) => {
  const { number, message } = req.body;

  console.log("Reached here");

  if (!number || !message) {
    return res.status(400).send('❌ Missing number or message');
  }

  const chatId = `${number}@c.us`;

  console.log("Reached here 2");

  try {
    await client.sendMessage(chatId, message);
    console.log(`✅ Sent to ${number}: ${message}`);
    res.status(200).send('✅ Message sent!');
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).send('❌ Failed to send message');
  }
});

app.listen(3000, () => {
  console.log('🚀 Server listening on port 3000');
});
