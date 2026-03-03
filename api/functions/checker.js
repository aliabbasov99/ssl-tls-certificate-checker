const tls = require('tls');
const dns = require('dns').promises;
const axios = require('axios');


const getSSLDetails = async (domain) => {
    const results = {
        domain: domain,
        ip: null,
        serverType: 'Unknown',
        certInfo: {},
        chain: [] // For the "Chain" section in the UI
    };

    try {
        const dnsData = await dns.lookup(domain);
        results.ip = dnsData.address;

        try {
            const response = await axios.get(`https://${domain}`, { 
                timeout: 3000,
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            results.serverType = response.headers['server'] || 'Unknown';
        } catch (e) {
            results.serverType = e.response?.headers['server'] || 'Unknown';
        }

        return new Promise((resolve, reject) => {
            const socket = tls.connect(443, domain, { servername: domain, rejectUnauthorized: false }, () => {
                const cert = socket.getPeerCertificate(true); // Retrieves the full certificate chain
                results.isTrusted = socket.authorized || false;

                const dnsNames = [];
        
                // Extracting SAN (Subject Alternative Names)
                if (cert.subjectaltname) {
                    cert.subjectaltname.split(', ').forEach(name => {
                        if (name.startsWith('DNS:')) {
                            dnsNames.push(name.replace('DNS:', '').trim());
                        }
                    });
                }
        
                // Also adding the Common Name to the list
                if (cert.subject.CN) {
                    dnsNames.push(cert.subject.CN.trim());
                }

                // Checking host validity with Wildcard (*.domain.com) support
                results.isHostValid = dnsNames.some(name => {
                    const pattern = name.replace(/\./g, '\\.').replace(/\*/g, '[^.]+');
                    const regex = new RegExp(`^${pattern}$`, 'i');
                    return regex.test(domain);
                });

                if (cert && Object.keys(cert).length > 0) {
                    // Main "Server" certificate details
                    const now = new Date();
                    const expiry = new Date(cert.valid_to);
                    results.daysRemaining = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
                    
                    results.certInfo = {
                        commonName: cert.subject.CN,
                        sans: cert.subjectaltname, // SANs field
                        organization: cert.subject.O,
                        location: `${cert.subject.L || ''}, ${cert.subject.ST || ''}, ${cert.subject.C || ''}`,
                        validFrom: cert.valid_from,
                        validTo: cert.valid_to,
                        serialNumber: cert.serialNumber,
                        signatureAlgorithm: 'sha256WithRSAEncryption', // Typically used in Node.js
                        issuer: cert.issuer.CN || cert.issuer.O
                    };

                    // Collecting Certificate Chain data
                    let currentCert = cert;
                    
                    while (currentCert.issuerCertificate && currentCert.issuerCertificate.fingerprint !== currentCert.fingerprint) {
                        const issuer = currentCert.issuerCertificate;
                        results.chain.push({
                            commonName: issuer.subject.CN,
                            organization: issuer.subject.O,
                            location: issuer.subject.C,
                            validFrom: issuer.valid_from,
                            validTo: issuer.valid_to,
                            serialNumber: issuer.serialNumber,
                            issuer: issuer.issuer.CN || issuer.issuer.O
                        });
                        currentCert = issuer;
                    }
                }
                
                socket.destroy();
                resolve(results);
            });

            socket.on('error', (err) => reject(err));
            socket.setTimeout(5000, () => { 
                socket.destroy(); 
                reject(new Error("Timeout")); 
            });
        });
    } catch (error) { 
        throw error; 
    }
};

module.exports = getSSLDetails;