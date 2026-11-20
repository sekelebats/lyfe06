const express = require('express');
const path = require('node:path');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const PUBLIC = path.join(__dirname, 'public');

app.disable('x-powered-by');
app.use((req, res, next) => {
  if (/\.(?:css|js|woff2?|avif|webp|jpe?g|png|svg)$/i.test(req.path)) {
    res.setHeader('Cache-Control', 'public, max-age=3600');
  } else {
    res.setHeader('Cache-Control', 'no-cache');
  }
  next();
});
app.use(express.static(PUBLIC, { extensions: ['html'], index: 'index.html' }));
app.use((req, res) => res.status(404).sendFile(path.join(PUBLIC, '404.html')));

app.listen(PORT, () => console.log(`Awwra → http://localhost:${PORT}`));
