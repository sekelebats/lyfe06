const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use('/fonts', express.static(path.join(__dirname, 'node_modules/@fontsource-variable/inter/files')));
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => console.log(`Awwra dev → http://localhost:${PORT}`));
