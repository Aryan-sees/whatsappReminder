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
  const encoded = encodeURIComponent(qr);
  const qrLink = `https://api.qrserver.com/v1/create-qr-code/?data=${encoded}&size=300x300`;
  console.log('📲 Scan this QR from link:');
  console.log(qrLink);
});

client.on('ready', () => {
  console.log('✅ WhatsApp client is ready!');
});

client.initialize();

// Send message to group "ReminderWA"
app.post('/send', async (req, res) => {
  const message = req.body.message;
  const groupName = 'ReminderWA';

  res.status(202).send('🚀 Message is being processed'); // respond immediately

  try {
    const chats = await client.getChats();
    const group = chats.find(chat => chat.isGroup && chat.name === groupName);

    if (!group) {
      console.error('❌ Group not found');
      return;
    }

    await client.sendMessage(group.id._serialized, message);
    console.log('✅ Message sent to group!');
  } catch (error) {
    console.error('❌ Error sending message:', error);
  }
});


app.listen(3000, () => {
  console.log('🚀 Webhook listening on port 3000');
});
