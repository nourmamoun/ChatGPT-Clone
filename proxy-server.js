const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const path = require('path');

const app = express();
const PORT = 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Serve static files from current directory
app.use(express.static(__dirname));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Proxy server is running' });
});

// Proxy endpoint for OpenAI API
app.post('/api/chat', async (req, res) => {
    try {
        console.log('Received chat request:', req.body);
        const { messages, apiKey } = req.body;
        
        if (!messages || !apiKey) {
            return res.status(400).json({ 
                error: { message: 'Missing messages or apiKey in request' } 
            });
        }
        
        // Initialize OpenAI client with the provided API key
        const openai = new OpenAI({
            apiKey: apiKey,
        });
        
        console.log('Making request to OpenAI API using gpt-4o-mini...');
        
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",  
            messages: messages,
            max_tokens: 500,
            temperature: 0.7,
            store: true  
        });

        console.log('OpenAI response received successfully');
        
        const response = {
            choices: [{
                message: {
                    content: completion.choices[0].message.content,
                    role: completion.choices[0].message.role
                }
            }]
        };
        
        console.log('Sending response:', response);
        res.json(response);
        
    } catch (error) {
        console.error('Proxy error:', error);
        
        // Handle different types of OpenAI errors
        if (error.code === 'insufficient_quota') {
            return res.status(429).json({ 
                error: { 
                    message: 'You exceeded your current quota, please check your plan and billing details.',
                    type: 'insufficient_quota',
                    code: 'insufficient_quota'
                } 
            });
        }
        
        if (error.code === 'invalid_api_key') {
            return res.status(401).json({ 
                error: { 
                    message: 'Invalid API key provided.',
                    type: 'invalid_request_error',
                    code: 'invalid_api_key'
                } 
            });
        }
        
        res.status(500).json({ 
            error: { 
                message: 'Proxy server error: ' + (error.message || 'Unknown error'),
                type: error.type || 'api_error'
            } 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server running at http://localhost:${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser to use the chat app`);
});
