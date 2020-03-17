const express = require('express');

const bodyParser = require('body-parser');

const path = require('path');

const app = express();

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/templates', 'index.html'));
});

app.get('/angry', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/templates', 'angry.html'));
});

app.listen(3000, () => {
    console.log('App listens on port 3000!');
});