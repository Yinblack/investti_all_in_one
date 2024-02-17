import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.static(path.join(__dirname, 'dist')));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = 9000;
app.listen(PORT, () => {
  const networkInterfaces = os.networkInterfaces();
  for (const key in networkInterfaces) {
    const iface = networkInterfaces[key];
    for (let i = 0; i < iface.length; i++) {
      if (iface[i].family === 'IPv4' && !iface[i].internal) {
        console.log(`La aplicación está disponible en http://${iface[i].address}:${PORT}`);
      }
    }
  }
});