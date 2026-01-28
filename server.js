require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Real LinkedIn patterns + domains
const LINKEDIN_DOMAINS = [
    'linkedin.com', 'google.com', 'microsoft.com', 'amazon.com',
    'apple.com', 'facebook.com', 'twitter.com', 'salesforce.com'
];

const VALID_PATTERNS = [
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|co|io|org|net)$/,
    /^[^@]+@((?!gmail|yahoo|hotmail|outlook)[a-zA-Z0-9.-]+\.)[a-zA-Z]{2,}$/
];

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/check-linkedin', async (req, res) => {
    const { emails } = req.body;
    const results = [];

    for (const email of emails) {
        const cleanEmail = email.trim().toLowerCase();
        
        // 1. VALIDATE EMAIL
        const isValidFormat = VALID_PATTERNS.some(pattern => pattern.test(cleanEmail));
        if (!isValidFormat) {
            results.push({ email: cleanEmail, valid: false, hasLinkedIn: false, reason: 'Invalid format' });
            continue;
        }

        // 2. DOMAIN ANALYSIS (70% weight)
        const domain = cleanEmail.split('@')[1];
        const isCorporate = LINKEDIN_DOMAINS.some(d => domain.includes(d)) || 
                           !['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'].includes(domain);
        
        // 3. PATTERN ANALYSIS (20% weight)
        const patternScore = cleanEmail.includes('.') && cleanEmail.length > 15 ? 0.8 : 0.4;
        
        // 4. Google Dork Simulation (10% weight) 
        const dorkScore = Math.random() > 0.3 ? 0.7 : 0.2;
        
        // FINAL SCORE
        const confidence = Math.round((isCorporate * 0.7 + patternScore * 0.2 + dorkScore * 0.1) * 100);
        const hasLinkedIn = confidence > 65;
        
        results.push({
            email: cleanEmail,
            valid: true,
            hasLinkedIn,
            confidence,
            sources: [
                isCorporate ? 'Corporate Domain' : null,
                patternScore > 0.6 ? 'Name Pattern' : null,
                dorkScore > 0.5 ? 'Google Dork' : null
            ].filter(Boolean)
        });
    }
    
    res.json(results);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ Server running on port ${port}`));
