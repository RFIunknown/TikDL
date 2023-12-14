import express from 'express';
import bodyParser from 'body-parser';
import { tiktokDL } from './src/tiktokDL.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fetch from "node-fetch";
import morgan from 'morgan';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const blockedIps = [""];

const app = express();
const port = process.env.PORT || 3000;
var router = express.Router();

app.enable('trust proxy');
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  console.log(`Request from IP address: ${clientIP}`);
  if (blockedIps.includes(clientIP)) {
    return res.status(403).json({ error: 'Akses Diblokir ' });
  }
  next();
});

app.use(express.static(__dirname + '/public'));


function isBase64(str) {
    if (str ==='' || str.trim() ===''){ return false; }
    try {
        return btoa(atob(str)) == str;
    } catch (err) {
        return false;
    }
}

app.get("/id", async function (req, res) {
    const clientIP = req.ip || req.connection.remoteAddress;
    console.log(`Request from IP address: ${clientIP}`);
    let { id, ext, hex } = req.query;
    if (!id || !ext || !hex) return res.sendStatus(400);
    if (!isBase64(hex)) return res.sendStatus(403);
    let hexdecode = Buffer.from(hex, "base64").toString();
    if (!/(tiktokcdn\.com|akamaized.net|tikwm.com)/gi.test(hexdecode)) return res.status(400).send("Invalid Hex ID!");
    try {
        let fetchdt = await fetch(hexdecode);
        let headers = await fetchdt.headers;
        if (!headers.get("content-type")) return res.status(400).send("Failed to get content!");
        let buffer = await fetchdt.buffer();
        res.type(headers.get("content-type"));
        res.attachment(`${id}.${ext}`);
        res.send(buffer);
    } catch (e) {
        res.sendStatus(500);
    }
})

app.post('/url', async (req, res) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    console.log(`Request from IP address: ${clientIP}`);
    let { videoUrl } = req.body;
    // get url video
    let {nowm, wm, music} = await tiktokDL(videoUrl);
    res.send(JSON.stringify({nowm, wm, music}))
})

app.get('/', (req, res) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  console.log(`Request from IP address: ${clientIP}`);
  res.sendFile(__dirname + '/public/index.html');
});

app.get('*', async (req, res) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    console.log(`Request from IP address: ${clientIP}`);
    res.sendFile(__dirname + '/public/404.html')
})

app.listen(port, () => {
    console.log(`Server Actived- http://localhost:${port}`)
})