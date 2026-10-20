// Servidor HTTP local ligero con Node.js puro (Cero dependencias)
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let cleanPath = req.url.split('?')[0];
  if (cleanPath === '/' || cleanPath === '') {
    cleanPath = '/index.html';
  }
  let filePath = path.join(__dirname, cleanPath);
  
  fs.stat(filePath, (err, stats) => {
    // Si es un directorio, intentar servir su index.html
    if (!err && stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      try {
        const indexStats = fs.statSync(filePath);
        if (!indexStats.isFile()) {
          err = new Error('Not a file');
        }
      } catch (e) {
        err = e;
      }
    }

    if (err) {
      // Soporte SPA: si no existe el archivo, servir index.html
      const fallbackIndex = path.join(__dirname, 'index.html');
      if (fs.existsSync(fallbackIndex)) {
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache'
        });
        fs.createReadStream(fallbackIndex).pipe(res);
        return;
      }
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 No encontrado');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  💍 Nuestra Boda Católica - Servidor Local Iniciado`);
  console.log(`  🌐 Accede en: http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
