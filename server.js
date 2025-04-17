require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const app = express();
const path = require('path');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

app.get('/', (req, res) => {
  res.render('index', { shortUrl: null, custom: false });
});

app.post('/shorten', (req, res) => {
  const { originalUrl, customCode } = req.body;
  const shortCode = customCode || Math.random().toString(36).substring(2, 8);

  db.query('INSERT INTO urls (short_code, original_url) VALUES (?, ?)', [shortCode, originalUrl], (err) => {
    if (err) return res.send('Erreur: ce code est peut-être déjà pris.');
    res.render('index', { shortUrl: `${req.headers.host}/${shortCode}`, custom: !!customCode });
  });
});

app.get('/:code', (req, res) => {
  const code = req.params.code;
  db.query('SELECT original_url FROM urls WHERE short_code = ?', [code], (err, results) => {
    if (results.length > 0) {
      res.redirect(results[0].original_url);
    } else {
      res.send('Lien non trouvé');
    }
  });
});

app.listen(3000, () => console.log('Serveur démarré sur http://localhost:3000'));
