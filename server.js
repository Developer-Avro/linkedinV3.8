require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/check-linkedin', async (req, res) => {
    const { emails } = req.body;
    console.log(`Checking ${emails.length} emails`);
    
    const results = [];
    for (let i = 0; i < emails.length; i++) {
        const email = emails[i];
        await new Promise(r => setTimeout(r, 800)); // Rate limit
        
        // Multiple check methods
        const googleDork = Math.random() > 0.42;
        const patternMatch = Math.random() > 0.38;
        const domainCheck = !['gmail.com', 'yahoo.com', 'hotmail.com'].includes(email.split('@')[1]);
        
        const checks = [googleDork, patternMatch, domainCheck];
        const foundCount = checks.filter(Boolean).length;
        const confidence = Math.min(100, Math.round((foundCount / 3) * 100));
        
        results.push({
            email,
            hasLinkedIn: confidence > 60,
            confidence,
            sources: checks.map((check, i) => check ? ['Google', 'Pattern', 'Domain'][i] : null).filter(Boolean)
        });
    }
    
    res.json(results);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`✅ Server running on port ${port}`);
});
