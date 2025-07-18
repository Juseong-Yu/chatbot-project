const express = require('express');
const bodyParser = require('body-parser');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();
const path = require('path');


const app = express();
const PORT = 3000;

// Simple in-memory conversation history per session (by IP)
const conversationHistories = {};

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// OpenAI API endpoint
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'No message provided' });
  }
  // Use IP as a simple session key (not secure, but works for demo)
  const sessionKey = req.ip;
  if (!conversationHistories[sessionKey]) {
    conversationHistories[sessionKey] = [
      { role: 'system', content: 'You are a helpful assistant.' }
    ];
  }
  // Add user message to history
  conversationHistories[sessionKey].push({ role: 'user', content: message });
  // Only keep the last 10 messages for context
  const messagesForOpenAI = conversationHistories[sessionKey].slice(-10);
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messagesForOpenAI
      })
    });
    const data = await response.json();
    if (!response.ok) {
      console.error('OpenAI API response:', data);
    }
    const botReply = data.choices?.[0]?.message?.content || 'No response from OpenAI.';
    // Add bot reply to history
    conversationHistories[sessionKey].push({ role: 'assistant', content: botReply });
    res.json({ reply: botReply });
  } catch (err) {
    console.error('OpenAI API error:', err);
    res.status(500).json({ error: 'Failed to fetch from OpenAI', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
