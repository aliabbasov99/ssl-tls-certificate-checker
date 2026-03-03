require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');
const cors = require('cors');

const getSSLDetails = require('./functions/checker');

app.use(cors());
app.use(express.json());

// Define routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/api/check', async (req, res) => {
    let { domain } = req.query;

    if (!domain) {
        return res.status(400).json({ 
            success: false, 
            message: "Zəhmət olmasa yoxlamaq üçün bir domen daxil edin." 
        });
    }

    // 1. URL Sanitization
    // If the user enters https://www.facebook.com/test, this converts it to facebook.com
    let cleanDomain = domain
        .replace(/^(https?:\/\/)?(www\.)?/, '') // Remove protocol and www
        .split('/')[0]                          // Remove path segments
        .split(':')[0];                         // Remove port number if exists

    try {
        // 2. Fetch detailed data from checker.js
        const data = await getSSLDetails(cleanDomain);

        // 3. Add summary messages for the UI status icons
        const extendedData = {
            ...data,
            summary: {
            resolvesTo: `${cleanDomain} ${data.ip} ünvanına yönləndirilir.`,
            serverHeader: `Server Tipi: ${data.serverType}`,
            isTrustedMessage: data.isTrusted 
                ? "Sertifikat bütün böyük veb brauzerlər tərəfindən etibar edilir." 
                : "Sertifikat bütün brauzerlər tərəfindən ETİBAR EDİLMİR.",
            expiryMessage: `Sertifikat ${data.daysRemaining} gün ərzində müddəti bitəcək.`,
            issuer: `Sertifikat ${data.certInfo.issuer} tərəfindən verilmişdir.`,
                        hostMatchMessage: data.isHostValid 
                ? `Hostname (${cleanDomain}) sertifikatda düzgün qeyd olunub.`
                : `Hostname (${cleanDomain}) sertifikat adları ilə UYĞUN GƏLMIR.`,
            
            
            }
        };

        res.json(extendedData);

    } catch (error) {
        console.error("Error occurred:", error.message);
        res.status(500).json({ 
            success: false, 
        });
    }
}); 

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
module.exports = app;