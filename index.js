const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const client = new Client({
  authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
  console.log('Scan this QR with your phone:', qr);
});

client.on('ready', () => {
  console.log('WhatsApp client is ready!');
});

app.post('/send-group', async (req, res) => {
  const { groupName, message } = req.body;
  const chats = await client.getChats();
  const group = chats.find(chat => chat.isGroup && chat.name === groupName);

  if (group) {
    await group.sendMessage(message);
    res.send('✅ Message sent to group!');
  } else {
    res.status(404).send('❌ Group not found');
  }
});

client.initialize();

app.listen(3000, () => {
  console.log('🚀 Bot listening on port 3000');
});
