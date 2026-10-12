const fs = require('fs');
const path = require('path');
const os = require('os');

// =====================================================================
// 1. PRE-LOAD ON-DISK PATCH (MUST RUN BEFORE REQUIRING WHATSAPP-WEB.JS)
// This strips __x_id so WhatsApp Web does not throw getter memoize errors
// =====================================================================
const possibleUtilsPaths = [
    path.join(__dirname, 'node_modules', 'whatsapp-web.js', 'src', 'util', 'Injected', 'Utils.js'),
    path.join(__dirname, '..', 'node_modules', 'whatsapp-web.js', 'src', 'util', 'Injected', 'Utils.js')
];

for (const utilsPath of possibleUtilsPaths) {
    if (fs.existsSync(utilsPath)) {
        try {
            let utilsCode = fs.readFileSync(utilsPath, 'utf8');
            let modified = false;

            // Patch 1: Remove __x_id when processMediaData finishes
            if (utilsCode.includes('return mediaData;') && !utilsCode.includes('delete mediaData.__x_id;')) {
                utilsCode = utilsCode.replace('return mediaData;', 'if (mediaData) { delete mediaData.__x_id; }\n    return mediaData;');
                modified = true;
            }

            // Patch 2: Remove __x_id right before message is dispatched
            if (!utilsCode.includes('delete message.__x_id')) {
                utilsCode = utilsCode.replace(
                    /(\w+\.addAndSendMsgToChat\s*\(\s*chat\s*,\s*message\s*\))/g,
                    '(delete message.__x_id, $1)'
                );
                utilsCode = utilsCode.replace(
                    /(\w+\.sendMessageToChat\s*\(\s*chat\s*,\s*message\s*\))/g,
                    '(delete message.__x_id, $1)'
                );
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(utilsPath, utilsCode, 'utf8');
                console.log('[INFO] Successfully applied media getter patch to Utils.js');
            }
        } catch (patchErr) {
            console.warn('[PATCH WARNING]', patchErr.message);
        }
        break;
    }
}

// =====================================================================
// 2. DEPENDENCIES & SERVER SETUP
// =====================================================================
const express = require('express');
const cors = require('cors');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');

const app = express();
// Allow up to 100MB for media files (images, documents, videos)
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(cors({ origin: '*' }));

// User accounts database
const USERS_FILE = path.join(__dirname, 'users.json');
if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]), 'utf8');
}

function getUsers() {
    try {
        return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    } catch (e) {
        return [];
    }
}

function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

// -----------------------------------------------------------------
// 3. AUTHENTICATION & USER MANAGEMENT APIs
// -----------------------------------------------------------------

app.post('/api/register/', (req, res) => {
    const { name, email, phone, password } = req.body;
    if (!email || !password || !name) {
        return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const users = getUsers();
    const existingUser = users.find(u => u.email === email.toLowerCase());
    if (existingUser) {
        return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const newUser = { name, email: email.toLowerCase(), phone: phone || '', password };
    users.push(newUser);
    saveUsers(users);

    console.log(`[REGISTER] New user created: ${email}`);
    return res.status(201).json({ success: true, name: newUser.name, email: newUser.email, phone: newUser.phone });
});

app.post('/api/login/', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    const users = getUsers();
    const user = users.find(u => u.email === email.toLowerCase() && u.password === password);
    
    if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
    }

    console.log(`[LOGIN] User logged in: ${user.email}`);
    return res.status(200).json({ success: true, name: user.name, email: user.email, phone: user.phone });
});

app.get('/api/users/', (req, res) => {
    const users = getUsers();
    const safeUsers = users.map(({ name, email, phone }) => ({ name, email, phone }));
    return res.status(200).json(safeUsers);
});

app.delete('/api/users/:email/', (req, res) => {
    const emailToDelete = req.params.email.toLowerCase();
    let users = getUsers();
    const initialLength = users.length;
    
    users = users.filter(u => u.email !== emailToDelete);
    
    if (users.length === initialLength) {
        return res.status(404).json({ error: 'User not found.' });
    }

    saveUsers(users);
    console.log(`[DELETE] User account deleted: ${emailToDelete}`);
    return res.status(200).json({ message: 'User deleted successfully' });
});

// -----------------------------------------------------------------
// 4. WHATSAPP ENGINE & IN-BROWSER INTERCEPTOR
// -----------------------------------------------------------------
const SAFE_DATA_DIR = path.join(os.homedir(), 'WaCampaignData');
if (!fs.existsSync(SAFE_DATA_DIR)) fs.mkdirSync(SAFE_DATA_DIR, { recursive: true });
const AUTH_DIR = path.join(SAFE_DATA_DIR, '.wwebjs_auth');

function getBrowserPath() {
    const paths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'
    ];
    for (const p of paths) {
        if (fs.existsSync(p)) return p;
    }
    return undefined;
}

let client = null;
let currentStatus = 'disconnected';
let latestQR = null;
let isConnected = false;
let connectedPhone = null;
const messageQueue = [];
let isProcessingQueue = false;

// Injects directly into the live Chromium page to catch and clean payloads
async function injectRuntimeMediaPatch() {
    if (!client || !client.pupPage) return;
    try {
        await client.pupPage.evaluate(() => {
            function cleanMsg(msg) {
                if (msg && typeof msg === 'object') {
                    delete msg.__x_id;
                }
            }

            // Hook processMediaData
            if (window.WWebJS && window.WWebJS.processMediaData && !window.WWebJS.processMediaData._patched) {
                const origProcess = window.WWebJS.processMediaData;
                window.WWebJS.processMediaData = async function(...args) {
                    const res = await origProcess.apply(this, args);
                    cleanMsg(res);
                    return res;
                };
                window.WWebJS.processMediaData._patched = true;
            }

            // Hook message dispatchers in Store
            if (window.Store) {
                if (window.Store.addAndSendMsgToChat && !window.Store.addAndSendMsgToChat._patched) {
                    const origAdd = window.Store.addAndSendMsgToChat;
                    window.Store.addAndSendMsgToChat = function(chat, msg, ...args) {
                        cleanMsg(msg);
                        return origAdd.apply(this, [chat, msg, ...args]);
                    };
                    window.Store.addAndSendMsgToChat._patched = true;
                }

                if (window.Store.SendMessage) {
                    ['addAndSendMsgToChat', 'sendMessageToChat'].forEach(fn => {
                        if (window.Store.SendMessage[fn] && !window.Store.SendMessage[fn]._patched) {
                            const origSend = window.Store.SendMessage[fn];
                            window.Store.SendMessage[fn] = function(chat, msg, ...args) {
                                cleanMsg(msg);
                                return origSend.apply(this, [chat, msg, ...args]);
                            };
                            window.Store.SendMessage[fn]._patched = true;
                        }
                    });
                }
            }
        });
    } catch (_) {}
}

function startWhatsAppEngine() {
    if (client) {
        try { client.destroy(); } catch (e) {}
    }
    currentStatus = 'loading';
    latestQR = null;
    isConnected = false;
    connectedPhone = null;

    client = new Client({
        authStrategy: new LocalAuth({ dataPath: AUTH_DIR }),
        puppeteer: {
            headless: true,
            executablePath: getBrowserPath(),
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        },
        // Remote cache providing stable Webpack hooks
        webVersionCache: {
            type: 'remote',
            remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
        }
    });

    client.on('qr', (qr) => {
        latestQR = qr;
        currentStatus = 'qr_ready';
        isConnected = false;
        connectedPhone = null;
        console.log('[QR CODE RECEIVED]');
    });

    client.on('ready', async () => {
        isConnected = true;
        currentStatus = 'connected';
        latestQR = null;
        if (client.info && client.info.wid) connectedPhone = client.info.wid.user;
        console.log('[SUCCESS] WhatsApp Client Connected!');
        await injectRuntimeMediaPatch();
    });

    client.on('auth_failure', () => { currentStatus = 'disconnected'; });
    client.on('disconnected', () => {
        isConnected = false;
        currentStatus = 'disconnected';
        connectedPhone = null;
        latestQR = null;
    });

    client.initialize().catch(() => { currentStatus = 'disconnected'; });
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function processQueue() {
    if (isProcessingQueue) return;
    isProcessingQueue = true;

    while (messageQueue.length > 0) {
        const task = messageQueue.shift();
        const { cleanPhone, message, media_base64, media_name, media_mimetype, media_type } = task;
        const chatId = `${cleanPhone}@c.us`;

        try {
            await injectRuntimeMediaPatch();

            let mediaObj = null;
            if (media_base64) {
                const b64data = media_base64.replace(/^data:.*?;base64,/, '');
                const mimeMatch = media_base64.match(/^data:(.*?);base64,/);
                
                let mime = media_mimetype || (mimeMatch ? mimeMatch[1] : null);
                if (!mime) {
                    if (media_type === 'image') mime = 'image/jpeg';
                    else if (media_type === 'video') mime = 'video/mp4';
                    else mime = 'application/pdf';
                }

                const filename = media_name || (media_type === 'doc' ? 'document.pdf' : 'file');
                mediaObj = new MessageMedia(mime, b64data, filename);
            }

            if (mediaObj) {
                const sendOptions = { caption: message || '' };
                if (media_type === 'doc' || (mediaObj.mimetype && !mediaObj.mimetype.startsWith('image/') && !mediaObj.mimetype.startsWith('video/'))) {
                    sendOptions.sendMediaAsDocument = true;
                }

                await client.sendMessage(chatId, mediaObj, sendOptions);
                console.log(`[SENT] Media (${media_type || 'file'}) delivered to ${cleanPhone}`);
            } else {
                await client.sendMessage(chatId, message || '');
                console.log(`[SENT] Text delivered to ${cleanPhone}`);
            }
        } catch (error) {
            console.error(`[ERROR] Failed sending to ${cleanPhone}:`, error.message);
        }

        if (messageQueue.length > 0) await delay(50000); // 50-second anti-ban delay
    }
    isProcessingQueue = false;
}

// -----------------------------------------------------------------
// 5. CAMPAIGN ENDPOINTS
// -----------------------------------------------------------------

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.get('/status', (req, res) => {
    res.json({ connected: isConnected, qr: latestQR, loading: currentStatus === 'loading', number: connectedPhone });
});

app.post('/generate-qr', (req, res) => {
    startWhatsAppEngine();
    res.json({ success: true });
});

app.post('/logout', async (req, res) => {
    if (client) {
        try { await client.logout(); } catch (err) {}
        try { await client.destroy(); } catch (err) {}
    }
    isConnected = false;
    currentStatus = 'disconnected';
    connectedPhone = null;
    latestQR = null;
    res.json({ success: true });
});

app.post('/send-message', async (req, res) => {
    const { phone, phones, message, media_base64, media_name, media_mimetype, media_type } = req.body;
    if (!isConnected) return res.status(400).json({ success: false, error: 'WhatsApp is not connected' });

    let rawPhones = phones ? (Array.isArray(phones) ? phones : phones.split(',')) : [phone];
    rawPhones.forEach(p => {
        let cleanPhone = String(p).replace(/\D/g, '');
        if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
        if (cleanPhone) {
            messageQueue.push({ 
                cleanPhone, 
                message, 
                media_base64, 
                media_name, 
                media_mimetype, 
                media_type 
            });
        }
    });

    processQueue();
    res.status(200).json({ success: true, message: 'Message(s) queued successfully.' });
});

const PORT = 3000;
app.listen(PORT, '127.0.0.1', () => {
    console.log(`[SERVER] Unified Node Backend running on http://localhost:${PORT}`);
});