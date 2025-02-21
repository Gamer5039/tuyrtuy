const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
require('dotenv').config();

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true }
});

client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('Bot is ready!');
});

client.on('message', async msg => {
  try {
    // Ignore own messages and group chats
    if(msg.fromMe || msg.isGroupMsg) return;

    // Get message text
    const userMessage = msg.body;

    // Get AI response
    const aiResponse = await getAIResponse(userMessage);
    
    // Send reply
    msg.reply(aiResponse);
  } catch (error) {
    console.error('Error:', error);
  }
});

async function getAIResponse(prompt) {
  const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
    model: 'deepseek-chat',
    messages: [{ role: 'user', content: prompt }]
  }, {
    headers: {
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  return response.data.choices[0].message.content;
}

client.initialize();